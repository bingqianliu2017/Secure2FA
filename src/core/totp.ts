/**
 * TOTP 纯 Web Crypto API 实现，兼容所有现代浏览器
 * 参考 RFC 6238
 */

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_PERIOD = 30;

/** 缓存 CryptoKey，避免每秒重复 importKey（昂贵操作） */
const keyCache = new Map<string, CryptoKey>();

/**
 * Base32 解码为 Uint8Array
 */
function decodeBase32(encoded: string): Uint8Array {
  const clean = encoded.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let binary = "";
  for (const c of clean) {
    const i = BASE32_CHARS.indexOf(c);
    if (i === -1) throw new Error("Invalid Base32 character");
    binary += i.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i < binary.length; i += 8) {
    const chunk = binary.slice(i, i + 8);
    if (chunk.length) bytes.push(parseInt(chunk.padEnd(8, "0"), 2));
  }
  return new Uint8Array(bytes);
}

/**
 * 生成 TOTP 6 位验证码
 */
export async function getTOTPCode(secret: string): Promise<string> {
  if (!secret?.trim()) return "------";
  try {
    const key = secret.trim().replace(/\s/g, "").toUpperCase();
    if (key.length < 16) return "------";

    let cryptoKey = keyCache.get(key);
    if (!cryptoKey) {
      const byteKey = decodeBase32(key);
      const keyBuf = byteKey.buffer.slice(
        byteKey.byteOffset,
        byteKey.byteOffset + byteKey.byteLength
      ) as ArrayBuffer;
      cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBuf,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
      );
      keyCache.set(key, cryptoKey);
    }

    const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
    const counterHex = counter.toString(16).padStart(16, "0");
    const counterBytes = new Uint8Array(
      counterHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
    );
    const counterBuf = counterBytes.buffer.slice(
      counterBytes.byteOffset,
      counterBytes.byteOffset + counterBytes.byteLength
    ) as ArrayBuffer;

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterBuf);
    const hmac = new Uint8Array(signature);

    const offset = hmac[hmac.length - 1]! & 0x0f;
    const code =
      ((hmac[offset]! & 0x7f) << 24) |
      (hmac[offset + 1]! << 16) |
      (hmac[offset + 2]! << 8) |
      hmac[offset + 3]!;
    const otp = (code % 1_000_000).toString().padStart(6, "0");

    return otp;
  } catch {
    return "------";
  }
}

/**
 * 获取当前 30 秒周期内的剩余秒数（1-30）
 */
export function getRemainingSeconds(): number {
  const elapsed = Math.floor(Date.now() / 1000) % TOTP_PERIOD;
  return TOTP_PERIOD - elapsed;
}

/**
 * 获取进度条比例（1.0 = 满，0.0 = 空，随时间减少）
 */
export function getProgress(): number {
  return getRemainingSeconds() / TOTP_PERIOD;
}

/**
 * 校验 Base32 secret 格式
 */
export function isValidSecret(secret: string): boolean {
  const cleaned = secret.replace(/\s/g, "").toUpperCase();
  const base32Regex = /^[A-Z2-7]+=*$/;
  return base32Regex.test(cleaned) && cleaned.length >= 16;
}

/**
 * 规范化 secret（去空格、转大写）
 */
export function normalizeSecret(secret: string): string {
  return secret.replace(/\s/g, "").toUpperCase();
}
