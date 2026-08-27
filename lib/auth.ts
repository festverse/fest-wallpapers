const ADMIN_EMAIL = "eoindatuganvillarin@gmail.com";
const PASSWORD_SALT = "wp-prosox-v1";
const PASSWORD_HASH = "442fc814e044e9b6bcd2757f8b6a3696362336f20ca4668f60c90cefe1c21565";
export const SESSION_COOKIE = "wp_admin_session";

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length > 0) {
    return secret;
  }
  return "wp-prosox-fallback-secret-change-me";
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  if (!email || !password) {
    return false;
  }
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
    return false;
  }
  const hash = await sha256Hex(PASSWORD_SALT + ":" + password);
  return hash === PASSWORD_HASH;
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ email: ADMIN_EMAIL, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 });
  const encoded = btoa(payload);
  const signature = await hmacSign(encoded);
  return encoded + "." + signature;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }
  const expected = await hmacSign(parts[0]);
  if (expected !== parts[1]) {
    return false;
  }
  try {
    const payload = JSON.parse(atob(parts[0]));
    if (!payload || typeof payload.exp !== "number") {
      return false;
    }
    return payload.exp > Date.now();
  } catch (error) {
    return false;
  }
}
