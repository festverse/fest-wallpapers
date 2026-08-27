export const SESSION_COOKIE = "wp_admin_session";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

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
  return getEnv("SESSION_SECRET");
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toHex(signature);
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  if (!email || !password) {
    return false;
  }
  if (email.trim().toLowerCase() !== getEnv("ADMIN_EMAIL")) {
    return false;
  }
  const hash = await sha256Hex(getEnv("PASSWORD_SALT") + ":" + password);
  return hash === getEnv("PASSWORD_HASH");
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    email: getEnv("ADMIN_EMAIL"),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });
  const encoded = btoa(payload);
  const signature = await hmacSign(encoded);
  return encoded + "." + signature;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
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
