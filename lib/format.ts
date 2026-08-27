export function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes) || bytes <= 0) {
    return "Size unavailable";
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return mb.toFixed(1) + " MB";
  }
  const kb = bytes / 1024;
  return Math.max(1, Math.round(kb)) + " KB";
}

export function altFromWallpaper(title: string, tags: string[], width: number, height: number): string {
  const tagPart = tags && tags.length > 0 ? tags.slice(0, 4).join(", ") : "wallpaper";
  return title + " - " + tagPart + " - " + width + "x" + height + " free wallpaper download";
}
