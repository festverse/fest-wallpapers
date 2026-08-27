import { Wallpaper, FeedQuery } from "@/lib/types";

const API = "https://wall.alphacoders.com/api2.0/get.php";

function normalize(item: any): Wallpaper {
  const category = item.category ? String(item.category) : "wallpaper";
  return {
    id: String(item.id),
    source: "alphacoders",
    title: category + " wallpaper " + item.width + "x" + item.height,
    tags: [category.toLowerCase(), item.sub_category ? String(item.sub_category).toLowerCase() : "art"].filter(Boolean),
    thumbUrl: item.url_thumb || item.url_image,
    previewUrl: item.url_thumb || item.url_image,
    fullUrl: item.url_image,
    width: Number(item.width) || 0,
    height: Number(item.height) || 0,
    fileSizeBytes: typeof item.file_size === "number" ? item.file_size : null,
    color: "#181c25",
    downloadUrl: item.url_image
  };
}

export async function fetchAlphacoders(query: FeedQuery): Promise<Wallpaper[]> {
  const key = process.env.ALPHACODERS_API_KEY;
  if (!key) {
    return [];
  }
  const params = new URLSearchParams();
  params.set("auth", key);
  if (query.q) {
    params.set("method", "search");
    params.set("term", query.q);
    params.set("page", String(query.page));
    if (query.sort === "latest") {
      params.set("sort", "newest");
    }
  } else if (query.sort === "random") {
    params.set("method", "random");
    params.set("count", "30");
  } else {
    params.set("method", query.sort === "popular" ? "popular" : "newest");
    params.set("page", String(query.page));
  }
  const res = await fetch(API + "?" + params.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 }
  });
  if (!res.ok) {
    throw new Error("upstream " + res.status);
  }
  const json: any = await res.json();
  if (!json || json.success === false || !Array.isArray(json.wallpapers)) {
    return [];
  }
  return json.wallpapers.map(normalize);
}

export async function fetchAlphacodersById(id: string): Promise<Wallpaper | null> {
  const key = process.env.ALPHACODERS_API_KEY;
  if (!key) {
    return null;
  }
  const params = new URLSearchParams();
  params.set("auth", key);
  params.set("method", "wallpaper_info");
  params.set("id", id);
  const res = await fetch(API + "?" + params.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 }
  });
  if (!res.ok) {
    return null;
  }
  const json: any = await res.json();
  if (!json || json.success === false || !json.wallpaper) {
    return null;
  }
  const wallpaper = normalize(json.wallpaper);
  if (Array.isArray(json.tags) && json.tags.length > 0) {
    wallpaper.tags = json.tags.map((t: any) => String(t.name || t)).slice(0, 10);
    wallpaper.title = wallpaper.tags.slice(0, 3).join(", ") + " wallpaper";
  }
  return wallpaper;
}
