import { Wallpaper, FeedQuery, RESOLUTIONS } from "@/lib/types";

const API = "https://wallhaven.cc/api/v1";

function mapSort(sort: string): string {
  if (sort === "popular") {
    return "toplist";
  }
  if (sort === "random") {
    return "random";
  }
  return "date_added";
}

function titleFor(item: any, query: FeedQuery): string {
  const base = query.q
    ? query.q.charAt(0).toUpperCase() + query.q.slice(1)
    : item.category
      ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
      : "Featured";
  return base + " wallpaper " + item.resolution;
}

function normalize(item: any, query: FeedQuery): Wallpaper {
  const tags = query.q ? query.q.split(" ").filter(Boolean) : ["wallpaper", item.category || "general"];
  return {
    id: String(item.id),
    source: "wallhaven",
    title: titleFor(item, query),
    tags,
    thumbUrl: item.thumbs && item.thumbs.small ? item.thumbs.small : item.path,
    previewUrl: item.thumbs && item.thumbs.large ? item.thumbs.large : item.path,
    fullUrl: item.path,
    width: Number(item.dimension_x) || 0,
    height: Number(item.dimension_y) || 0,
    fileSizeBytes: typeof item.file_size === "number" ? item.file_size : null,
    color: Array.isArray(item.colors) && item.colors.length > 0 ? item.colors[0] : "#181c25",
    downloadUrl: item.path
  };
}

function buildParams(query: FeedQuery, page: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set("categories", "111");
  params.set("purity", "100");
  params.set("page", String(page));
  params.set("sorting", mapSort(query.sort));
  if (query.sort === "popular") {
    params.set("topRange", "1M");
  }
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.resolution && RESOLUTIONS[query.resolution]) {
    const r = RESOLUTIONS[query.resolution];
    params.set("atleast", r.w + "x" + r.h);
  }
  if (query.orientation === "landscape") {
    params.set("ratios", "16x9,16x10,21x9,32x9");
  }
  if (query.orientation === "portrait") {
    params.set("ratios", "9x16,9x18,10x16");
  }
  if (query.color) {
    params.set("colors", query.color.replace("#", ""));
  }
  return params;
}

async function fetchPage(query: FeedQuery, page: number): Promise<Wallpaper[]> {
  const res = await fetch(API + "/search?" + buildParams(query, page).toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 }
  });
  if (!res.ok) {
    throw new Error("upstream " + res.status);
  }
  const json: any = await res.json();
  if (!json || !Array.isArray(json.data)) {
    return [];
  }
  return json.data.map((item: any) => normalize(item, query));
}

export async function fetchWallhaven(query: FeedQuery): Promise<Wallpaper[]> {
  const first = query.page * 2 - 1;
  const results = await Promise.allSettled([fetchPage(query, first), fetchPage(query, first + 1)]);
  const out: Wallpaper[] = [];
  let anyOk = false;
  for (const result of results) {
    if (result.status === "fulfilled") {
      anyOk = true;
      out.push(...result.value);
    }
  }
  if (!anyOk) {
    throw new Error("feed unavailable");
  }
  return out;
}

export async function fetchWallhavenById(id: string): Promise<Wallpaper | null> {
  const res = await fetch(API + "/w/" + encodeURIComponent(id), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    return null;
  }
  const json: any = await res.json();
  if (!json || !json.data) {
    return null;
  }
  const item = json.data;
  const tags = Array.isArray(item.tags) ? item.tags.map((t: any) => String(t.name)) : [];
  return {
    id: String(item.id),
    source: "wallhaven",
    title: tags.length > 0 ? tags.slice(0, 3).join(", ") + " wallpaper" : "Wallpaper " + item.resolution,
    tags,
    thumbUrl: item.thumbs && item.thumbs.small ? item.thumbs.small : item.path,
    previewUrl: item.thumbs && item.thumbs.large ? item.thumbs.large : item.path,
    fullUrl: item.path,
    width: Number(item.dimension_x) || 0,
    height: Number(item.dimension_y) || 0,
    fileSizeBytes: typeof item.file_size === "number" ? item.file_size : null,
    color: Array.isArray(item.colors) && item.colors.length > 0 ? item.colors[0] : "#181c25",
    downloadUrl: item.path
  };
}
