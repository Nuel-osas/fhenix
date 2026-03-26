/**
 * On-chain data reading helpers.
 * Reads from VeilDataMarket contract on Arbitrum Sepolia via viem.
 */

import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, stringToBytes32 } from "./fhenix";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"),
});

export async function getListingInfo(listingId: string) {
  try {
    const result = await client.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "getListingInfo",
      args: [stringToBytes32(listingId)],
    });
    return {
      seller: result[0],
      price: result[1],
      active: result[2],
      purchaseCount: result[3],
    };
  } catch {
    return null;
  }
}

export async function getTotalListings(): Promise<number> {
  try {
    const result = await client.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "totalListings",
    });
    return Number(result);
  } catch {
    return 0;
  }
}

export async function hasPurchased(listingId: string, buyer: string): Promise<boolean> {
  try {
    const result = await client.readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "hasPurchased",
      args: [stringToBytes32(listingId), buyer as `0x${string}`],
    });
    return result;
  } catch {
    return false;
  }
}

export function statusLabel(status: number): string {
  switch (status) {
    case 1: return "Active";
    case 0: return "Deactivated";
    default: return "Unknown";
  }
}
