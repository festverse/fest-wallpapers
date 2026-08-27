import { NextRequest, NextResponse } from "next/server";
import { isAllowedImageUrl } from "@/lib/allowed-hosts";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target || !isAllowedImageUrl(target)) {
    return NextResponse.json({ bytes: null }, { status: 400 });
  }
  try {
    const head = await fetch(target, { method: "HEAD", redirect: "follow" });
    const length = head.headers.get("content-length");
    const bytes = length ? Number(length) : null;
    return NextResponse.json(
      { bytes: Number.isFinite(bytes as number) ? bytes : null },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } }
    );
  } catch (error) {
    return NextResponse.json({ bytes: null }, { status: 200 });
  }
}
