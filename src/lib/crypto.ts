/**
 * Client-side AES-256-GCM encryption/decryption using Web Crypto API.
 * All encryption happens in the browser — raw data never leaves the client.
 */

export interface EncryptionResult {
  encryptedBlob: Blob;
  key: string; // hex-encoded AES key
  iv: string; // hex-encoded IV
  originalSize: number;
  encryptedSize: number;
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Encrypt a file with AES-256-GCM.
 * Returns the encrypted blob + the key and IV needed for decryption.
 */
export async function encryptFile(file: File): Promise<EncryptionResult> {
  // Generate random 256-bit key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  // Generate random 96-bit IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Read file as ArrayBuffer
  const plaintext = await file.arrayBuffer();

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  // Export key as raw bytes
  const rawKey = await crypto.subtle.exportKey("raw", key);

  return {
    encryptedBlob: new Blob([ciphertext], {
      type: "application/octet-stream",
    }),
    key: bufToHex(rawKey),
    iv: bufToHex(iv.buffer),
    originalSize: plaintext.byteLength,
    encryptedSize: ciphertext.byteLength,
  };
}

/**
 * Decrypt an encrypted blob with the AES key and IV.
 * Returns the original file contents.
 */
export async function decryptBlob(
  encryptedData: ArrayBuffer,
  keyHex: string,
  ivHex: string
): Promise<ArrayBuffer> {
  const rawKey = hexToBuf(keyHex);
  const iv = hexToBuf(ivHex);

  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    encryptedData
  );

  return plaintext;
}

/**
 * Encode the AES key + IV into a single string for storage/transfer.
 * Format: key:iv (both hex-encoded)
 */
export function packKey(keyHex: string, ivHex: string): string {
  return `${keyHex}:${ivHex}`;
}

/**
 * Decode a packed key string back into key and IV.
 */
export function unpackKey(packed: string): { key: string; iv: string } {
  const [key, iv] = packed.split(":");
  return { key, iv };
}

/**
 * Convert a key string to a field-compatible bigint for Fhenix.
 * Splits the 256-bit key into two 128-bit field elements.
 */
export function keyToFields(keyHex: string): [string, string] {
  const half = keyHex.length / 2;
  const field1 = BigInt("0x" + keyHex.slice(0, half));
  const field2 = BigInt("0x" + keyHex.slice(half));
  return [field1.toString() + "field", field2.toString() + "field"];
}

/**
 * Convert two field elements back to a hex key string.
 */
export function fieldsToKey(field1: string, field2: string): string {
  const n1 = BigInt(field1.replace("field", ""));
  const n2 = BigInt(field2.replace("field", ""));
  const hex1 = n1.toString(16).padStart(32, "0");
  const hex2 = n2.toString(16).padStart(32, "0");
  return hex1 + hex2;
}
