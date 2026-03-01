import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars).
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string (32 bytes).");
  }
  return Buffer.from(key, "hex");
}

// Encrypt a string using AES-256-GCM.
// Returns "<iv_hex>.<ciphertext_hex>.<tag_hex>"
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit nonce (recommended for GCM)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}.${encrypted.toString("hex")}.${tag.toString("hex")}`;
}

// Decrypt a string produced by encrypt().
export function decrypt(data: string): string {
  const parts = data.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted format.");
  const [ivHex, ciphertextHex, tagHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

// Safe decrypt — returns null instead of throwing on failure.
export function safeDecrypt(data: string | null | undefined): string | null {
  if (!data) return null;
  try {
    return decrypt(data);
  } catch {
    return null;
  }
}
