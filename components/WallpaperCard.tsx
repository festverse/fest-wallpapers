import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { Wallpaper } from "@/lib/types";
import { altFromWallpaper } from "@/lib/format";

export default function WallpaperCard({
  wallpaper,
  index,
  variant
}: {
  wallpaper: Wallpaper;
  index: number;
  variant: "grid" | "row";
}) {
  const ratio = wallpaper.width > 0 && wallpaper.height > 0 ? wallpaper.width / wallpaper.height : 16 / 10;
  const alt = altFromWallpaper(wallpaper.title, wallpaper.tags, wallpaper.width, wallpaper.height);
  const href = "/wallpaper/" + wallpaper.source + "/" + encodeURIComponent(wallpaper.id);
  const isRow = variant === "row";
  const priority = !isRow && index < 4;
  return (
    <Link
      href={href}
      className={
        (isRow ? "row-card w-56 shrink-0 sm:w-72" : "grid-card w-full") +
        " group relative block overflow-hidden rounded-2xl bg-ink-800 outline-none ring-offset-2 focus-visible:ring-2"
      }
      style={isRow ? { aspectRatio: "16 / 10" } : { aspectRatio: String(ratio) }}
      aria-label={alt}
    >
      <Image
        src={wallpaper.thumbUrl}
        alt={alt}
        fill
        quality={62}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={isRow ? "(max-width: 640px) 224px, 288px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"}
        className="object-cover"
        style={{ backgroundColor: wallpaper.color }}
      />
      <div className="grid-card-veil absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink-950/85 via-transparent to-transparent p-3">
        <p className="truncate text-xs font-semibold text-bone-100">{wallpaper.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-bone-100/70">
          {wallpaper.source} - {wallpaper.width} x {wallpaper.height}
          <Download size={11} strokeWidth={2} className="ml-auto" />
        </p>
      </div>
    </Link>
  );
}
