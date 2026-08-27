"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Wallpaper } from "@/lib/types";
import WallpaperCard from "@/components/WallpaperCard";
import { RowSkeleton } from "@/components/Skeletons";

export default function LazyRow({ title, query, index }: { title: string; query: string; index: number }) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[] | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const params = new URLSearchParams();
        params.set("q", query);
        params.set("sort", "popular");
        params.set("orientation", "landscape");
        const res = await fetch("/api/wallpapers?" + params.toString());
        if (!res.ok) {
          throw new Error("row failed");
        }
        const json = await res.json();
        if (!cancelled) {
          setWallpapers(Array.isArray(json.wallpapers) ? json.wallpapers : []);
        }
      } catch (error) {
        if (!cancelled) {
          setWallpapers([]);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [visible, query]);

  if (wallpapers !== null && wallpapers.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-5 sm:px-8" aria-label={title}>
      <div className="flex items-baseline gap-4 border-t border-current/[0.05] pt-6">
        <span className="font-heading text-xs font-extrabold tabular-nums opacity-30">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <Link
          href={"/?q=" + encodeURIComponent(query) + "#gallery"}
          className="group ml-auto flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] opacity-60 transition-opacity hover:opacity-100"
        >
          See all
          <ArrowRight size={14} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {wallpapers === null ? (
        <RowSkeleton />
      ) : (
        <div className="row-scroller">
          {wallpapers.slice(0, 12).map((wallpaper, cardIndex) => (
            <WallpaperCard
              key={wallpaper.source + wallpaper.id}
              wallpaper={wallpaper}
              index={cardIndex}
              variant="row"
            />
          ))}
        </div>
      )}
    </section>
  );
}
