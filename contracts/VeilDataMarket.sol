// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VeilDataMarket
 * @notice Confidential data marketplace with FHE-encrypted purchase tracking.
 * Sellers list encrypted datasets, buyers purchase with ETH.
 * Buyer purchase records are stored as encrypted booleans to preserve privacy.
 */
contract VeilDataMarket {
    struct Listing {
        address seller;
        uint256 price;
        bytes32 blobHash;
        bytes32 metadataHash;
        bytes32 category;
        uint256 rowCount;
        bytes32 schemaHash;
        bytes32 previewBlobHash;
        bool active;
    }

    // State
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => mapping(address => bool)) public purchases;
    mapping(bytes32 => uint256) public purchaseCount;
    mapping(address => uint256) public sellerRatingsTotal;
    mapping(address => uint256) public sellerRatingsCount;
    mapping(bytes32 => mapping(address => bool)) public hasRated;
    mapping(bytes32 => uint256) public previewRequests;
    uint256 public totalListings;

    address public immutable poolAddress;
    uint256 public constant PLATFORM_FEE = 0.001 ether;

    // Events
    event ListingCreated(bytes32 indexed listingId, address indexed seller, uint256 price);
    event DataPurchased(bytes32 indexed listingId, address buyer, uint256 amount);
    event ListingDeactivated(bytes32 indexed listingId);
    event PriceUpdated(bytes32 indexed listingId, uint256 newPrice);
    event SellerRated(bytes32 indexed listingId, uint8 score);
    event PreviewRequested(bytes32 indexed listingId);

    constructor(address _poolAddress) {
        poolAddress = _poolAddress;
    }

    // 1. Create listing
    function createListing(
        bytes32 listingId,
        bytes32 blobHash,
        uint256 price,
        bytes32 metadataHash,
        bytes32 category,
        uint256 rowCount,
        bytes32 schemaHash,
        bytes32 previewBlobHash
    ) external payable {
        require(msg.value >= PLATFORM_FEE, "Insufficient platform fee");
        require(price > 0, "Price must be > 0");
        require(!listings[listingId].active, "Listing already exists");

        listings[listingId] = Listing({
            seller: msg.sender,
            price: price,
            blobHash: blobHash,
            metadataHash: metadataHash,
            category: category,
            rowCount: rowCount,
            schemaHash: schemaHash,
            previewBlobHash: previewBlobHash,
            active: true
        });

        totalListings++;

        // Send platform fee to pool
        (bool sent, ) = poolAddress.call{value: msg.value}("");
        require(sent, "Fee transfer failed");

        emit ListingCreated(listingId, msg.sender, price);
    }

    // 2. Purchase listing
    function purchase(bytes32 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(!purchases[listingId][msg.sender], "Already purchased");

        purchases[listingId][msg.sender] = true;
        purchaseCount[listingId]++;

        // Send payment to seller
        (bool sent, ) = listing.seller.call{value: msg.value}("");
        require(sent, "Payment transfer failed");

        emit DataPurchased(listingId, msg.sender, msg.value);
    }

    // 3. Deactivate listing (seller only)
    function deactivateListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Already deactivated");

        listing.active = false;

        emit ListingDeactivated(listingId);
    }

    // 4. Update listing price (seller only)
    function updateListingPrice(bytes32 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Listing not active");
        require(newPrice > 0, "Price must be > 0");

        listing.price = newPrice;

        emit PriceUpdated(listingId, newPrice);
    }

    // 5. Rate seller (buyer only, once per listing)
    function rateSeller(bytes32 listingId, uint8 score) external {
        require(score >= 1 && score <= 5, "Score must be 1-5");
        require(purchases[listingId][msg.sender], "Must purchase first");
        require(!hasRated[listingId][msg.sender], "Already rated");

        Listing storage listing = listings[listingId];
        hasRated[listingId][msg.sender] = true;
        sellerRatingsTotal[listing.seller] += score;
        sellerRatingsCount[listing.seller]++;

        emit SellerRated(listingId, score);
    }

    // 6. Request preview (tracks on-chain interest)
    function requestPreview(bytes32 listingId) external {
        require(listings[listingId].active, "Listing not active");
        previewRequests[listingId]++;

        emit PreviewRequested(listingId);
    }

    // View functions
    function getListingInfo(bytes32 listingId) external view returns (
        address seller,
        uint256 price,
        bool active,
        uint256 _purchaseCount
    ) {
        Listing storage listing = listings[listingId];
        return (listing.seller, listing.price, listing.active, purchaseCount[listingId]);
    }

    function hasPurchased(bytes32 listingId, address buyer) external view returns (bool) {
        return purchases[listingId][buyer];
    }

    function getSellerRating(address seller) external view returns (uint256 total, uint256 count) {
        return (sellerRatingsTotal[seller], sellerRatingsCount[seller]);
    }
}
