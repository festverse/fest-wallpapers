import { NextRequest, NextResponse } from "next/server";
import { isAllowedImageUrl } from "@/lib/allowed-hosts";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  const name = request.nextUrl.searchParams.get("name") || "wallpaper";
  if (!target || !isAllowedImageUrl(target)) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  try {
    const upstream = await fetch(target, { redirect: "follow" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "fetch failed" }, { status: 502 });
    }
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    let extension = "jpg";
    if (contentType.includes("png")) {
      extension = "png";
    }
    if (contentType.includes("webp")) {
      extension = "webp";
    }
    if (contentType.includes("avif")) {
      extension = "avif";
    }
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "wallpaper";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", 'attachment; filename="' + safeName + "." + extension + '"');
    headers.set("Cache-Control", "public, s-maxage=86400");
    const length = upstream.headers.get("content-length");
    if (length) {
      headers.set("Content-Length", length);
    }
    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: "download failed" }, { status: 502 });
  }
}
