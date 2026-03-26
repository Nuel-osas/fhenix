/**
 * API client for vault storage and files.
 */

export interface VaultStorageInfo {
  totalBytes: number;
  usedBytes: number;
  remainingBytes: number;
}

export interface VaultFileRecord {
  id: number;
  owner: string;
  fileName: string;
  fileSize: number;
  blobId: string;
  encryptionKey?: string;
  createdAt: string;
}

export async function fetchVaultStorage(owner: string): Promise<VaultStorageInfo> {
  const res = await fetch(`/api/vault/storage?owner=${owner}`);
  if (!res.ok) return { totalBytes: 0, usedBytes: 0, remainingBytes: 0 };
  return res.json();
}

export async function recordStoragePurchase(data: {
  owner: string;
  txId: string;
  quantity?: number;
}): Promise<void> {
  const res = await fetch("/api/vault/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Failed to record storage purchase");
  }
}

export async function fetchVaultFiles(owner: string): Promise<VaultFileRecord[]> {
  const res = await fetch(`/api/vault/files?owner=${owner}`);
  if (!res.ok) return [];
  return res.json();
}

export async function saveVaultFile(data: {
  owner: string;
  fileName: string;
  fileSize: number;
  blobId: string;
  encryptionKey: string;
}): Promise<VaultFileRecord> {
  const res = await fetch("/api/vault/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to save vault file");
  }
  return res.json();
}

export async function fetchVaultFileKey(
  fileId: number,
  owner: string
): Promise<VaultFileRecord | null> {
  const res = await fetch(`/api/vault/files/${fileId}?owner=${owner}`);
  if (!res.ok) return null;
  return res.json();
}
