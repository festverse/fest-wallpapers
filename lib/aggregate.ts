import { Wallpaper, FeedQuery, FeedResult, RESOLUTIONS } from "@/lib/types";
import { fetchWallhaven, fetchWallhavenById } from "@/lib/sources/wallhaven";
import { fetchAlphacoders, fetchAlphacodersById } from "@/lib/sources/alphacoders";
import { fetchReddit, fetchRedditById } from "@/lib/sources/reddit";

const fetchers: Record<string, (q: FeedQuery) => Promise<Wallpaper[]>> = {
  wallhaven: fetchWallhaven,
  alphacoders: fetchAlphacoders,
  reddit: fetchReddit
};

function applyClientFilters(items: Wallpaper[], query: FeedQuery): Wallpaper[] {
  let out = items;
  if (query.resolution && RESOLUTIONS[query.resolution]) {
    const r = RESOLUTIONS[query.resolution];
    out = out.filter((w) => w.width >= r.w && w.height >= r.h);
  }
  if (query.orientation === "landscape") {
    out = out.filter((w) => w.width >= w.height);
  }
  if (query.orientation === "portrait") {
    out = out.filter((w) => w.height > w.width);
  }
  return out;
}

function interleave(groups: Wallpaper[][]): Wallpaper[] {
  const out: Wallpaper[] = [];
  const max = Math.max(...groups.map((g) => g.length), 0);
  for (let i = 0; i < max; i++) {
    for (const group of groups) {
      if (group[i]) {
        out.push(group[i]);
      }
    }
  }
  return out;
}

function dedupe(items: Wallpaper[]): Wallpaper[] {
  const seen = new Set<string>();
  const out: Wallpaper[] = [];
  for (const item of items) {
    const key = item.source + ":" + item.id;
    const urlKey = item.fullUrl;
    if (!seen.has(key) && !seen.has(urlKey)) {
      seen.add(key);
      if (urlKey) {
        seen.add(urlKey);
      }
      out.push(item);
    }
  }
  return out;
}

export async function fetchFeed(query: FeedQuery): Promise<FeedResult> {
  let wanted = query.source && query.source !== "all" && fetchers[query.source]
    ? [query.source]
    : Object.keys(fetchers);
  if (query.color) {
    wanted = ["wallhaven"];
  }
  const settled = await Promise.allSettled(wanted.map((name) => fetchers[name](query)));
  const groups: Wallpaper[][] = [];
  const sourcesUsed: string[] = [];
  const sourcesFailed: string[] = [];
  settled.forEach((result, index) => {
    const name = wanted[index];
    if (result.status === "fulfilled") {
      if (result.value.length > 0) {
        groups.push(applyClientFilters(result.value, query));
        sourcesUsed.push(name);
      }
    } else {
      sourcesFailed.push(name);
    }
  });
  let combined = dedupe(interleave(groups));
  if (query.sort === "random") {
    combined = combined
      .map((w) => ({ w, k: Math.random() }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.w);
  }
  return {
    wallpapers: combined,
    page: query.page,
    hasMore: combined.length > 0,
    sourcesUsed,
    sourcesFailed
  };
}

export async function fetchWallpaperById(source: string, id: string): Promise<Wallpaper | null> {
  if (source === "wallhaven") {
    return fetchWallhavenById(id);
  }
  if (source === "alphacoders") {
    return fetchAlphacodersById(id);
  }
  if (source === "reddit") {
    return fetchRedditById(id);
  }
  return null;
}

export function parseFeedQuery(searchParams: URLSearchParams): FeedQuery {
  const pageRaw = Number(searchParams.get("page") || "1");
  return {
    q: searchParams.get("q") || "",
    resolution: searchParams.get("resolution") || "",
    orientation: searchParams.get("orientation") || "",
    color: searchParams.get("color") || "",
    source: searchParams.get("source") || "all",
    sort: searchParams.get("sort") || "latest",
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  };
}
