/**
 * Walrus Sponsor SDK client.
 * Uses @3mate/walrus-sponsor-sdk for uploads and public aggregator for reads.
 */

import { WalrusSponsor, WalrusSponsorError } from "@3mate/walrus-sponsor-sdk";

const API_KEY = process.env.NEXT_PUBLIC_WALRUS_API_KEY || "";
const BASE_URL =
  process.env.NEXT_PUBLIC_WALRUS_SPONSOR_URL ||
  "https://walrus-sponsor.krill.tube";

let walrusClient: WalrusSponsor | null = null;

function getClient(): WalrusSponsor {
  if (!walrusClient) {
    walrusClient = new WalrusSponsor({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });
  }
  return walrusClient;
}

export interface UploadResult {
  blobId: string;
  sponsoredBlobId?: string;
  txDigest?: string;
  totalCharged?: number;
  alreadyCertified?: boolean;
}

/**
 * Upload an encrypted blob to Walrus via the Sponsor SDK.
 */
export async function uploadToWalrus(
  encryptedBlob: Blob,
  creatorAddress: string,
  epochs: number = 3
): Promise<UploadResult> {
  const client = getClient();

  const result = await client.upload(encryptedBlob, {
    creatorAddress,
    epochs,
    deletable: true,
  });

  // Handle already certified (duplicate content)
  if ("alreadyCertified" in result) {
    return {
      blobId: result.blobId,
      alreadyCertified: true,
    };
  }

  return {
    blobId: result.blobId,
    sponsoredBlobId: result.sponsoredBlobId,
    txDigest: result.txDigest,
    totalCharged: result.totalCharged,
  };
}

/**
 * Estimate upload cost before committing.
 */
export async function estimateCost(fileSize: number, epochs: number = 3) {
  const client = getClient();
  return client.estimateCost(fileSize, epochs);
}

/**
 * List blobs for this workspace.
 */
export async function listBlobs(opts?: {
  status?: "active" | "deleted" | "expired" | "transferred";
  limit?: number;
  offset?: number;
}) {
  const client = getClient();
  return client.listBlobs(opts);
}

/**
 * Get details for a single blob.
 */
export async function getBlob(blobId: string) {
  const client = getClient();
  return client.getBlob(blobId);
}

/**
 * Get public aggregator URL for a blob (for reading/downloading).
 */
const WALRUS_AGGREGATOR = "https://aggregator.walrus-mainnet.walrus.space";

export function getBlobUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
}

/**
 * Fetch an encrypted blob from the Walrus Aggregator.
 */
export async function fetchFromWalrus(blobId: string): Promise<ArrayBuffer> {
  const url = getBlobUrl(blobId);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.status}`);
  }

  return response.arrayBuffer();
}

export { WalrusSponsorError };
