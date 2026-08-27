import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  let body: any = null;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "missing credentials" }, { status: 400 });
  }
  const valid = await verifyCredentials(body.email, body.password);
  if (!valid) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
