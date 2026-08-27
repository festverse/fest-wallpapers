import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Sparkles } from "lucide-react";
import { Wallpaper } from "@/lib/types";
import { altFromWallpaper } from "@/lib/format";

interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function Hero({ content, featured }: { content: HeroContent; featured: Wallpaper | null }) {
  const accent = featured && featured.color ? featured.color : "#e8a95c";
  const words = content.title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  return (
    <section
      className="relative min-h-[92dvh] w-full overflow-hidden"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="absolute inset-0 overflow-hidden bg-ink-900">
        {featured ? (
          <Image
            src={featured.fullUrl || featured.previewUrl}
            alt={altFromWallpaper(featured.title, featured.tags, featured.width, featured.height)}
            fill
            priority
            quality={80}
            sizes="100vw"
            className="hero-pan object-cover"
            style={{ backgroundColor: featured.color }}
          />
        ) : (
          <div className="shimmer absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/50 to-ink-950/10" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-bone-50 to-transparent dark:from-ink-950" />
      </div>
      <div className="relative mx-auto flex min-h-[92dvh] max-w-7xl flex-col justify-end px-5 pb-28 pt-40 text-bone-100 sm:px-8">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] opacity-70">
          <Sparkles size={13} strokeWidth={1.8} style={{ color: "var(--accent)" }} />
          {content.eyebrow}
        </p>
        <h1 className="text-balance mt-6 max-w-4xl font-heading text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
          {words.join(" ")}{" "}
          {lastWord ? (
            <span className="relative inline-block">
              <span style={{ color: "var(--accent)" }}>{lastWord}</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-0 h-[3px] w-full opacity-70"
                style={{ background: "var(--accent)" }}
              />
            </span>
          ) : null}
        </h1>
        <p className="mt-7 max-w-xl text-base font-light leading-relaxed opacity-80 sm:text-lg">
          {content.subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            href={content.ctaHref}
            className="liquid-glass inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-extrabold uppercase tracking-[0.16em] transition-transform hover:scale-[1.03] active:scale-95"
          >
            {content.ctaLabel}
            <ArrowDown size={15} strokeWidth={2.2} />
          </Link>
          {featured ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
              Tonight&apos;s pick - {featured.width} x {featured.height}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
