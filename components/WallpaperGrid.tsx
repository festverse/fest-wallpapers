"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CloudOff, Loader2, Plus } from "lucide-react";
import { Wallpaper } from "@/lib/types";
import WallpaperCard from "@/components/WallpaperCard";
import { GridSkeleton } from "@/components/Skeletons";

export default function WallpaperGrid() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const seenRef = useRef<Set<string>>(new Set());
  const queryKey = searchParams.toString();

  const load = useCallback(
    async (reset: boolean) => {
      if (busyRef.current) {
        return;
      }
      busyRef.current = true;
      setLoading(true);
      const page = reset ? 1 : pageRef.current + 1;
      const params = new URLSearchParams(queryKey);
      params.set("page", String(page));
      try {
        const res = await fetch("/api/wallpapers?" + params.toString());
        if (!res.ok) {
          throw new Error("feed failed");
        }
        const json = await res.json();
        const incoming: Wallpaper[] = Array.isArray(json.wallpapers) ? json.wallpapers : [];
        if (reset) {
          seenRef.current = new Set();
        }
        const fresh = incoming.filter((w) => {
          const key = w.source + ":" + w.id;
          if (seenRef.current.has(key)) {
            return false;
          }
          seenRef.current.add(key);
          return true;
        });
        pageRef.current = page;
        setHasMore(incoming.length > 0 && page < 40);
        setFailed(Array.isArray(json.sourcesUsed) && json.sourcesUsed.length === 0);
        setItems((prev) => (reset ? fresh : [...prev, ...fresh]));
      } catch (error) {
        setHasMore(false);
      } finally {
        busyRef.current = false;
        setLoading(false);
      }
    },
    [queryKey]
  );

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    pageRef.current = 1;
    load(true);
  }, [load]);

  return (
    <div id="gallery" className="scroll-mt-28">
      {failed ? (
        <p className="mb-4 flex items-center gap-2 text-xs opacity-60">
          <CloudOff size={13} strokeWidth={2} />
          The wall is catching its breath. Try again in a moment.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
        {items.map((wallpaper, index) => (
          <WallpaperCard key={wallpaper.source + wallpaper.id} wallpaper={wallpaper} index={index} variant="grid" />
        ))}
      </div>
      {loading && items.length === 0 ? (
        <div className="mt-4">
          <GridSkeleton count={10} />
        </div>
      ) : null}
      {!loading && items.length === 0 ? (
        <div className="liquid-glass mx-auto max-w-md px-8 py-12 text-center">
          <p className="font-heading text-lg font-bold">Nothing on the wall for that mix</p>
          <p className="mt-2 text-sm opacity-65">Loosen the resolution or color filter and the wall will fill back in.</p>
        </div>
      ) : null}
      {items.length > 0 && hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => load(false)}
            disabled={loading}
            aria-busy={loading}
            className="liquid-glass inline-flex min-w-48 items-center justify-center gap-2.5 px-8 py-4 text-sm font-extrabold uppercase tracking-[0.16em] transition-transform hover:scale-[1.03] active:scale-95 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                Loading...
                <Loader2 size={16} strokeWidth={2.4} className="animate-spin" style={{ color: "var(--accent)" }} />
              </>
            ) : (
              <>
                Load more
                <Plus size={16} strokeWidth={2.4} style={{ color: "var(--accent)" }} />
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
