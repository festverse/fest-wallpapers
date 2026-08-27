import { Wallpaper, FeedQuery } from "@/lib/types";

const SUBS = "wallpaper+wallpapers+WQHD_Wallpaper+WidescreenWallpaper";
const UA = "fest-wallpaper-site/1.0";

function unescapeUrl(url: string): string {
  return url.replace(/&amp;/g, "&");
}

function normalize(post: any): Wallpaper | null {
  if (!post || post.over_18 || post.is_video) {
    return null;
  }
  const preview =
    post.preview && Array.isArray(post.preview.images)
      ? post.preview.images[0]
      : null;
  if (!preview || !preview.source) {
    return null;
  }
  const direct =
    typeof post.url_overridden_by_dest === "string" &&
    post.url_overridden_by_dest.includes("i.redd.it")
      ? post.url_overridden_by_dest
      : "";
  const full = direct || unescapeUrl(String(preview.source.url || ""));
  if (!full) {
    return null;
  }
  const resolutions = Array.isArray(preview.resolutions)
    ? preview.resolutions
    : [];
  const thumbCandidate =
    resolutions.length > 0
      ? resolutions[Math.min(3, resolutions.length - 1)]
      : null;
  const previewCandidate =
    resolutions.length > 0 ? resolutions[resolutions.length - 1] : null;
  return {
    id: String(post.id),
    source: "reddit",
    title: String(post.title || "Community wallpaper").slice(0, 120),
    tags: String(post.title || "wallpaper")
      .toLowerCase()
      .replace(/[\[\]().,]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !/^\d+x\d+$/.test(w))
      .slice(0, 6),
    thumbUrl: thumbCandidate ? unescapeUrl(String(thumbCandidate.url)) : full,
    previewUrl: previewCandidate
      ? unescapeUrl(String(previewCandidate.url))
      : full,
    fullUrl: full,
    width: Number(preview.source.width) || 0,
    height: Number(preview.source.height) || 0,
    fileSizeBytes: null,
    color: "#181c25",
    downloadUrl: full,
  };
}

export async function fetchReddit(query: FeedQuery): Promise<Wallpaper[]> {
  const params = new URLSearchParams();
  params.set("limit", "100");
  params.set("raw_json", "1");
  let endpoint = "";
  if (query.q) {
    params.set("q", query.q);
    params.set("restrict_sr", "1");
    params.set("sort", query.sort === "latest" ? "new" : "top");
    params.set("t", "year");
    endpoint =
      "https://www.reddit.com/r/" + SUBS + "/search.json?" + params.toString();
  } else {
    const listing = query.sort === "latest" ? "new" : "top";
    params.set("t", "month");
    endpoint =
      "https://www.reddit.com/r/" +
      SUBS +
      "/" +
      listing +
      ".json?" +
      params.toString();
  }
  if (query.page > 1) {
    return [];
  }
  const res = await fetch(endpoint, {
    headers: { Accept: "application/json", "User-Agent": UA },
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    throw new Error("upstream " + res.status);
  }
  const json: any = await res.json();
  const children =
    json && json.data && Array.isArray(json.data.children)
      ? json.data.children
      : [];
  const out: Wallpaper[] = [];
  for (const child of children) {
    const wallpaper = normalize(child ? child.data : null);
    if (wallpaper) {
      out.push(wallpaper);
    }
  }
  return out;
}

export async function fetchRedditById(id: string): Promise<Wallpaper | null> {
  const safe = id.replace(/[^a-z0-9]/gi, "");
  const res = await fetch(
    "https://www.reddit.com/by_id/t3_" + safe + ".json?raw_json=1",
    {
      headers: { Accept: "application/json", "User-Agent": UA },
      next: { revalidate: 3600 },
    },
  );
  if (!res.ok) {
    return null;
  }
  const json: any = await res.json();
  const children =
    json && json.data && Array.isArray(json.data.children)
      ? json.data.children
      : [];
  if (children.length === 0) {
    return null;
  }
  return normalize(children[0].data);
}
