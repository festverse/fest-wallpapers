import { NextRequest, NextResponse } from "next/server";
import { getR2 } from "@/lib/cms";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || !key.startsWith("media/")) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }
  const r2 = await getR2();
  if (!r2) {
    return NextResponse.json({ error: "storage unavailable" }, { status: 404 });
  }
  const object = await r2.get(key);
  if (!object) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const headers = new Headers();
  const contentType = object.httpMetadata && object.httpMetadata.contentType ? object.httpMetadata.contentType : "application/octet-stream";
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, s-maxage=31536000, immutable");
  return new NextResponse(object.body, { status: 200, headers });
}
