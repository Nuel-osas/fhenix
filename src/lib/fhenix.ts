/**
 * Fhenix contract interaction helpers.
 * Builds args for wagmi writeContract calls. All payments in USDC.
 */

import { keccak256, toBytes, parseGwei } from "viem";

// Arbitrum Sepolia gas override — base fee fluctuates around 0.02 gwei
const ARB_GAS = { maxFeePerGas: parseGwei("0.1"), maxPriorityFeePerGas: parseGwei("0.01") };

export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x27F1e7c2F3B72E80E23054A89af7798DF2386D86") as `0x${string}`;
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xc0e5BbCDF743d85a573f449f074d8f5bF7A6C9aA") as `0x${string}`;

// USDC has 6 decimals
const USDC_DECIMALS = 1_000_000;
export const PLATFORM_FEE = BigInt(1 * USDC_DECIMALS); // 1 USDC

export const USDC_ABI = [
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const MARKETPLACE_ABI = [
  {
    name: "createListing",
    type: "function",
    stateMutability: "nonpayable",
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
    stateMutability: "nonpayable",
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
    inputs: [{ name: "listingId", type: "bytes32" }],
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
] as const;

/**
 * Hash a string to bytes32.
 */
export function stringToBytes32(str: string): `0x${string}` {
  return keccak256(toBytes(str));
}

/**
 * Convert USDC amount (human readable) to on-chain uint256 (6 decimals).
 */
export function parseUSDC(amount: number): bigint {
  return BigInt(Math.round(amount * USDC_DECIMALS));
}

/**
 * Build USDC approve args (must be called before createListing or purchase).
 */
export function buildApproveArgs(spender: `0x${string}`, amount: bigint) {
  return {
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "approve" as const,
    args: [spender, amount] as const,
    gas: BigInt(100_000), ...ARB_GAS,
  };
}

/**
 * Build claim vUSDC args (mints 3 vUSDC directly from VeilUSDC contract).
 */
export function buildClaimUSDCArgs() {
  return {
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "claim" as const,
    gas: BigInt(200_000), ...ARB_GAS,
  };
}

/**
 * Build createListing args. Caller must approve PLATFORM_FEE first.
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
      parseUSDC(params.price),
      stringToBytes32(params.metadataHash),
      stringToBytes32(params.category),
      BigInt(params.rowCount),
      stringToBytes32(params.schemaHash),
      params.previewBlobHash ? stringToBytes32(params.previewBlobHash) : ("0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`),
    ] as const,
    gas: BigInt(500_000), ...ARB_GAS,
  };
}

/**
 * Build purchase args. Caller must approve listing price first.
 */
export function buildPurchaseArgs(params: {
  listingId: string;
}) {
  return {
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "purchase" as const,
    args: [stringToBytes32(params.listingId)] as const,
    gas: BigInt(300_000), ...ARB_GAS,
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
    gas: BigInt(200_000), ...ARB_GAS,
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
    args: [stringToBytes32(params.listingId), parseUSDC(params.newPrice)] as const,
    gas: BigInt(200_000), ...ARB_GAS,
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
    gas: BigInt(200_000), ...ARB_GAS,
  };
}
