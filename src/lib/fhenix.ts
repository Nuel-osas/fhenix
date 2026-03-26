/**
 * Fhenix contract interaction helpers.
 * Builds args for wagmi writeContract calls against VeilDataMarket on Arbitrum Sepolia.
 */

import { parseEther, keccak256, toBytes } from "viem";

export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x00206Efbf5C49B61f2701a20d86329df4C3aB50D") as `0x${string}`;

// Platform fee: 0.001 ETH
export const PLATFORM_FEE = parseEther("0.001");

export const MARKETPLACE_ABI = [
  {
    name: "createListing",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "listingId", type: "bytes32" },
      { name: "blobHash", type: "bytes32" },
      { name: "price", type: "uint256" },
      { name: "metadataHash", type: "bytes32" },
      { name: "category", type: "bytes32" },
      { name: "rowCount", type: "uint256" },
      { name: "schemaHash", type: "bytes32" },
      { name: "previewBlobHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "purchase",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "listingId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "deactivateListing",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "updateListingPrice",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "bytes32" },
      { name: "newPrice", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "rateSeller",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "bytes32" },
      { name: "score", type: "uint8" },
    ],
    outputs: [],
  },
  {
    name: "requestPreview",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "listingId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "getListingInfo",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "listingId", type: "bytes32" },
    ],
    outputs: [
      { name: "seller", type: "address" },
      { name: "price", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "purchaseCount", type: "uint256" },
    ],
  },
  {
    name: "totalListings",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasPurchased",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "listingId", type: "bytes32" },
      { name: "buyer", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "ListingCreated",
    type: "event",
    inputs: [
      { name: "listingId", type: "bytes32", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
    ],
  },
  {
    name: "DataPurchased",
    type: "event",
    inputs: [
      { name: "listingId", type: "bytes32", indexed: true },
      { name: "buyer", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/**
 * Hash a string to bytes32.
 */
export function stringToBytes32(str: string): `0x${string}` {
  return keccak256(toBytes(str));
}

/**
 * Build createListing args.
 */
export function buildCreateListingArgs(params: {
  listingId: string;
  blobHash: string;
  price: number;
  metadataHash: string;
  category: string;
  rowCount: number;
  schemaHash: string;
  previewBlobHash?: string;
}) {
  return {
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "createListing" as const,
    args: [
      stringToBytes32(params.listingId),
      stringToBytes32(params.blobHash),
      parseEther(params.price.toString()),
      stringToBytes32(params.metadataHash),
      stringToBytes32(params.category),
      BigInt(params.rowCount),
      stringToBytes32(params.schemaHash),
      params.previewBlobHash ? stringToBytes32(params.previewBlobHash) : ("0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`),
    ] as const,
    value: PLATFORM_FEE,
  };
}

/**
 * Build purchase args.
 */
export function buildPurchaseArgs(params: {
  listingId: string;
  price: number;
}) {
  return {
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "purchase" as const,
    args: [stringToBytes32(params.listingId)] as const,
    value: parseEther(params.price.toString()),
  };
}

/**
 * Build deactivateListing args.
 */
export function buildDeactivateArgs(params: { listingId: string }) {
  return {
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "deactivateListing" as const,
    args: [stringToBytes32(params.listingId)] as const,
  };
}

/**
 * Build updateListingPrice args.
 */
export function buildUpdatePriceArgs(params: { listingId: string; newPrice: number }) {
  return {
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "updateListingPrice" as const,
    args: [stringToBytes32(params.listingId), parseEther(params.newPrice.toString())] as const,
  };
}

/**
 * Build rateSeller args.
 */
export function buildRateSellerArgs(params: { listingId: string; score: number }) {
  return {
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "rateSeller" as const,
    args: [stringToBytes32(params.listingId), params.score] as const,
  };
}
