export type WallpaperSource = "wallhaven" | "alphacoders" | "reddit";

export interface Wallpaper {
  id: string;
  source: WallpaperSource;
  title: string;
  tags: string[];
  thumbUrl: string;
  previewUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  fileSizeBytes: number | null;
  color: string;
  downloadUrl: string;
}

export interface FeedQuery {
  q: string;
  resolution: string;
  orientation: string;
  color: string;
  source: string;
  sort: string;
  page: number;
}

export interface FeedResult {
  wallpapers: Wallpaper[];
  page: number;
  hasMore: boolean;
  sourcesUsed: string[];
  sourcesFailed: string[];
}

export const RESOLUTIONS: Record<string, { w: number; h: number; label: string }> = {
  "720p": { w: 1280, h: 720, label: "720p HD" },
  "1080p": { w: 1920, h: 1080, label: "1080p Full HD" },
  "1440p": { w: 2560, h: 1440, label: "1440p 2K" },
  "4k": { w: 3840, h: 2160, label: "4K Ultra HD" },
  "8k": { w: 7680, h: 4320, label: "8K" }
};
