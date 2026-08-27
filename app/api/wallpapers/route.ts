import { NextRequest, NextResponse } from "next/server";
import { fetchFeed, parseFeedQuery } from "@/lib/aggregate";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const query = parseFeedQuery(request.nextUrl.searchParams);
  try {
    const result = await fetchFeed(query);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { wallpapers: [], page: query.page, hasMore: false, sourcesUsed: [], sourcesFailed: ["all"] },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  }
}
