/**
 * Walrus Sponsor SDK client.
 * Uses @3mate/walrus-sponsor-sdk for uploads and public aggregator for reads.
 * Falls back to /api/walrus/upload proxy if SDK fails.
 */

import { WalrusSponsor } from "@3mate/walrus-sponsor-sdk";

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
 * Falls back to server-side proxy if Krill is down.
 */
export async function uploadToWalrus(
  encryptedBlob: Blob,
  creatorAddress: string,
  epochs: number = 3
): Promise<UploadResult> {
  // Try SDK first
  try {
    const client = getClient();
    const result = await client.upload(encryptedBlob, {
      creatorAddress,
      epochs,
      deletable: true,
    });

    if ("alreadyCertified" in result) {
      return { blobId: result.blobId, alreadyCertified: true };
    }

    return {
      blobId: result.blobId,
      sponsoredBlobId: result.sponsoredBlobId,
      txDigest: result.txDigest,
      totalCharged: result.totalCharged,
    };
  } catch (sdkErr) {
    console.warn("Walrus SDK failed, trying proxy fallback:", sdkErr);
  }

  // Fallback: server-side proxy (bypasses CORS, uses testnet publisher)
  const formData = new FormData();
  formData.append("file", encryptedBlob, "data.bin");
  formData.append("creator_address", creatorAddress);
  formData.append("epochs", epochs.toString());

  const res = await fetch("/api/walrus/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(data.error || `Upload failed (${res.status})`);
  }

  return res.json();
}

const WALRUS_AGGREGATOR = "https://aggregator.walrus-mainnet.walrus.space";

export function getBlobUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
}

export async function fetchFromWalrus(blobId: string): Promise<ArrayBuffer> {
  // Try mainnet aggregator first, fall back to testnet
  const urls = [
    `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blobId}`,
    `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.arrayBuffer();
    } catch {
      continue;
    }
  }

  throw new Error("Failed to fetch blob from Walrus");
}
