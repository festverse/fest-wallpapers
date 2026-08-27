import { NextRequest, NextResponse } from "next/server";
import { getCmsContent, saveCmsContent } from "@/lib/cms";

export const runtime = "edge";

export async function GET() {
  const content = await getCmsContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
  });
}

export async function PUT(request: NextRequest) {
  let body: any = null;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid content" }, { status: 400 });
  }
  await saveCmsContent(body);
  return NextResponse.json({ ok: true });
}
