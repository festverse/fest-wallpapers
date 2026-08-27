import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronRight, ExternalLink } from "lucide-react";
import { fetchWallpaperById } from "@/lib/aggregate";
import { altFromWallpaper } from "@/lib/format";

export const runtime = "edge";

const DownloadPanel = dynamic(() => import("@/components/DownloadPanel"));

interface PageProps {
  params: { source: string; id: string };
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://wallpaper-festverse-site.pages.dev";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const wallpaper = await fetchWallpaperById(params.source, params.id);
  if (!wallpaper) {
    return { title: "Wallpaper not found" };
  }
  const title =
    wallpaper.title.slice(0, 60) +
    " - " +
    wallpaper.width +
    "x" +
    wallpaper.height +
    " Wallpaper";
  const description =
    "Download " +
    wallpaper.title.slice(0, 80) +
    " free in " +
    wallpaper.width +
    "x" +
    wallpaper.height +
    ". Full quality original, no account needed.";
  const canonical =
    siteUrl +
    "/wallpaper/" +
    wallpaper.source +
    "/" +
    encodeURIComponent(wallpaper.id);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: wallpaper.previewUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [wallpaper.previewUrl],
    },
  };
}

export default async function WallpaperPage({ params }: PageProps) {
  const wallpaper = await fetchWallpaperById(params.source, params.id);
  if (!wallpaper) {
    notFound();
  }
  const alt = altFromWallpaper(
    wallpaper.title,
    wallpaper.tags,
    wallpaper.width,
    wallpaper.height,
  );
  const canonical =
    siteUrl +
    "/wallpaper/" +
    wallpaper.source +
    "/" +
    encodeURIComponent(wallpaper.id);
  const ratio =
    wallpaper.width > 0 && wallpaper.height > 0
      ? wallpaper.width / wallpaper.height
      : 16 / 9;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: wallpaper.fullUrl,
      thumbnailUrl: wallpaper.thumbUrl,
      name: wallpaper.title,
      description: alt,
      width: wallpaper.width,
      height: wallpaper.height,
      encodingFormat: "image/jpeg",
      acquireLicensePage: canonical,
      creditText: wallpaper.source,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Wallpapers",
          item: siteUrl + "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: wallpaper.title.slice(0, 60),
          item: canonical,
        },
      ],
    },
  ];

  return (
    <main
      className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8"
      style={{ ["--accent" as string]: wallpaper.color }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-xs opacity-60"
      >
        <Link href="/" className="hover:opacity-100">
          Wallpapers
        </Link>
        <ChevronRight size={12} strokeWidth={2} />
        <span className="truncate">{wallpaper.title.slice(0, 40)}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.7fr,1fr]">
        <div
          className="relative overflow-hidden rounded-3xl bg-ink-800"
          style={{
            aspectRatio: String(ratio),
            backgroundColor: wallpaper.color,
          }}
        >
          <Image
            src={wallpaper.previewUrl}
            alt={alt}
            fill
            priority
            quality={75}
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-balance font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
              {wallpaper.title}
            </h1>
            <p className="mt-3 text-sm opacity-65">
              {wallpaper.width} x {wallpaper.height} full quality original.
            </p>
            <a
              href={wallpaper.fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] opacity-50 transition-opacity hover:opacity-90"
            >
              Open original file
              <ExternalLink size={12} strokeWidth={2} />
            </a>
          </div>
          <DownloadPanel wallpaper={wallpaper} />
          {wallpaper.tags.length > 0 ? (
            <div>
              <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] opacity-50">
                Related
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {wallpaper.tags.slice(0, 10).map((tag) => (
                  <Link
                    key={tag}
                    href={"/?q=" + encodeURIComponent(tag) + "#gallery"}
                    className="rounded-full bg-black/10 px-3 py-1.5 text-xs font-semibold capitalize opacity-75 transition-opacity hover:opacity-100 dark:bg-white/10"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
