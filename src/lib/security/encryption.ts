import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const isProd = process.env.NODE_ENV === "production";
  const key = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET;

  if (isProd && (!key || key.length < 32)) {
    throw new Error("FATAL: ENCRYPTION_KEY (or AUTH_SECRET) of at least 32 characters is required in production");
  }

  const effectiveKey = key || "dev_secret_postinger_encryption_key_32_bytes_min";
  return crypto.createHash("sha256").update(effectiveKey).digest();
}

export function encryptToken(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptToken(cipherText: string): string {
  if (!cipherText) {
    throw new Error("Cannot decrypt empty cipher text");
  }

  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid cipher text format: expected iv:tag:data");
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Invalid cipher text format: missing components");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
