"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, HardDrive, Loader2 } from "lucide-react";
import { Wallpaper } from "@/lib/types";
import { formatBytes } from "@/lib/format";

export default function DownloadPanel({ wallpaper }: { wallpaper: Wallpaper }) {
  const [size, setSize] = useState<number | null | undefined>(undefined);
  const [fetching, setFetching] = useState(false);

  const loadSize = useCallback(async () => {
    if (wallpaper.fileSizeBytes) {
      setSize(wallpaper.fileSizeBytes);
      return;
    }
    if (!wallpaper.downloadUrl) {
      setSize(null);
      return;
    }
    setFetching(true);
    try {
      const res = await fetch("/api/filesize?url=" + encodeURIComponent(wallpaper.downloadUrl));
      if (res.ok) {
        const json = await res.json();
        setSize(typeof json.bytes === "number" ? json.bytes : null);
      } else {
        setSize(null);
      }
    } catch (error) {
      setSize(null);
    } finally {
      setFetching(false);
    }
  }, [wallpaper.downloadUrl, wallpaper.fileSizeBytes]);

  useEffect(() => {
    loadSize();
  }, [loadSize]);

  const downloadHref =
    "/api/download?url=" +
    encodeURIComponent(wallpaper.downloadUrl) +
    "&name=" +
    encodeURIComponent(wallpaper.source + "-" + wallpaper.id + "-" + wallpaper.width + "x" + wallpaper.height);

  return (
    <div className="liquid-glass px-6 py-6">
      <p className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Download</p>
      <p className="mt-3 text-sm opacity-70">
        Full quality original, exactly as the artist uploaded it.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <a
          href={downloadHref}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-white transition-transform hover:scale-[1.03] active:scale-95"
          style={{ background: "var(--accent)" }}
        >
          <Download size={16} strokeWidth={2.2} />
          Download {wallpaper.width} x {wallpaper.height}
        </a>
        <span className="flex items-center gap-1.5 text-sm opacity-70">
          {fetching ? (
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          ) : (
            <HardDrive size={14} strokeWidth={2} />
          )}
          {fetching ? "Checking size" : formatBytes(size === undefined ? null : size)}
        </span>
      </div>
    </div>
  );
}
