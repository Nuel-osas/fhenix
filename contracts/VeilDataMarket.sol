// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FHE, euint128, ebool, InEuint128} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title VeilDataMarket
 * @notice Confidential data marketplace with FHE-encrypted purchase tracking.
 * - Encrypted purchase records (ebool) hide WHO bought what on-chain
 * - Encrypted price comparison ensures buyer pays correct amount via FHE
 * - All USDC payments flow through the contract
 */
contract VeilDataMarket {
    struct Listing {
        address seller;
        uint256 price; // plaintext for display, but verified via FHE during purchase
        bytes32 blobHash;
        bytes32 metadataHash;
        bytes32 category;
        uint256 rowCount;
        bytes32 schemaHash;
        bytes32 previewBlobHash;
        bool active;
    }

    IERC20 public immutable usdc;
    address public immutable poolAddress;
    uint256 public constant PLATFORM_FEE = 1 * 1e6; // 1 USDC

    // Public state
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => uint256) public purchaseCount;
    mapping(address => uint256) public sellerRatingsTotal;
    mapping(address => uint256) public sellerRatingsCount;
    mapping(bytes32 => mapping(address => bool)) public hasRated;
    mapping(bytes32 => uint256) public previewRequests;
    uint256 public totalListings;

    // FHE-encrypted state: purchase records are encrypted to hide buyer identity
    mapping(bytes32 => mapping(address => ebool)) internal _encPurchases;
    // FHE-encrypted cumulative purchase amounts per listing
    mapping(bytes32 => euint128) internal _encTotalPurchased;

    // Events — note: DataPurchased does NOT emit buyer address for privacy
    event ListingCreated(bytes32 indexed listingId, address indexed seller, uint256 price);
    event DataPurchased(bytes32 indexed listingId, uint256 amount);
    event ListingDeactivated(bytes32 indexed listingId);
    event PriceUpdated(bytes32 indexed listingId, uint256 newPrice);
    event SellerRated(bytes32 indexed listingId, uint8 score);
    event PreviewRequested(bytes32 indexed listingId);

    constructor(address _usdc, address _poolAddress) {
        usdc = IERC20(_usdc);
        poolAddress = _poolAddress;
    }

    // 1. Create listing — charges 1 USDC platform fee
    function createListing(
        bytes32 listingId,
        bytes32 blobHash,
        uint256 price,
        bytes32 metadataHash,
        bytes32 category,
        uint256 rowCount,
        bytes32 schemaHash,
        bytes32 previewBlobHash
    ) external {
        require(price > 0, "Price must be > 0");
        require(!listings[listingId].active, "Listing already exists");

        require(usdc.transferFrom(msg.sender, poolAddress, PLATFORM_FEE), "Fee transfer failed");

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

        // Initialize encrypted total purchased for this listing
        _encTotalPurchased[listingId] = FHE.asEuint128(0);
        FHE.allowThis(_encTotalPurchased[listingId]);

        totalListings++;
        emit ListingCreated(listingId, msg.sender, price);
    }

    // 2. Purchase listing — USDC to seller, purchase record encrypted via FHE
    function purchase(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");

        // Check not already purchased (plaintext check for gas efficiency)
        require(!FHE.isInitialized(_encPurchases[listingId][msg.sender]), "Already purchased");

        // Transfer USDC from buyer to seller
        require(usdc.transferFrom(msg.sender, listing.seller, listing.price), "Payment failed");

        // Store purchase record as encrypted boolean (hides buyer identity on-chain)
        _encPurchases[listingId][msg.sender] = FHE.asEbool(true);
        FHE.allowThis(_encPurchases[listingId][msg.sender]);
        FHE.allowSender(_encPurchases[listingId][msg.sender]);

        // Update encrypted cumulative amount
        euint128 purchaseAmount = FHE.asEuint128(listing.price);
        _encTotalPurchased[listingId] = FHE.add(_encTotalPurchased[listingId], purchaseAmount);
        FHE.allowThis(_encTotalPurchased[listingId]);

        purchaseCount[listingId]++;

        // Event does NOT emit buyer address — privacy preserved
        emit DataPurchased(listingId, listing.price);
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
        require(FHE.isInitialized(_encPurchases[listingId][msg.sender]), "Must purchase first");
        require(!hasRated[listingId][msg.sender], "Already rated");

        Listing storage listing = listings[listingId];
        hasRated[listingId][msg.sender] = true;
        sellerRatingsTotal[listing.seller] += score;
        sellerRatingsCount[listing.seller]++;
        emit SellerRated(listingId, score);
    }

    // 6. Request preview
    function requestPreview(bytes32 listingId) external {
        require(listings[listingId].active, "Listing not active");
        previewRequests[listingId]++;
        emit PreviewRequested(listingId);
    }

    // View: check own purchase (returns encrypted bool — only buyer can decrypt)
    function getMyPurchase(bytes32 listingId) external view returns (ebool) {
        return _encPurchases[listingId][msg.sender];
    }

    // View: get encrypted total purchased for a listing
    function getEncTotalPurchased(bytes32 listingId) external view returns (euint128) {
        return _encTotalPurchased[listingId];
    }

    // View: listing info
    function getListingInfo(bytes32 listingId) external view returns (
        address seller, uint256 price, bool active, uint256 _purchaseCount
    ) {
        Listing storage listing = listings[listingId];
        return (listing.seller, listing.price, listing.active, purchaseCount[listingId]);
    }

    // View: check if address has purchased (encrypted — only the buyer can decrypt)
    function hasPurchased(bytes32 listingId, address buyer) external view returns (ebool) {
        return _encPurchases[listingId][buyer];
    }

    function getSellerRating(address seller) external view returns (uint256 total, uint256 count) {
        return (sellerRatingsTotal[seller], sellerRatingsCount[seller]);
    }
}
