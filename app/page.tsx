import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchFeed } from "@/lib/aggregate";
import { getCmsContent } from "@/lib/cms";
import { Wallpaper, RESOLUTIONS } from "@/lib/types";
import Hero from "@/components/Hero";
import LazyRow from "@/components/LazyRow";
import FilterBar from "@/components/FilterBar";
import WallpaperGrid from "@/components/WallpaperGrid";
import { GridSkeleton } from "@/components/Skeletons";

export const runtime = "edge";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://wallpaper-festverse-site.pages.dev";

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return value || "";
}

function describeFilters(searchParams: PageProps["searchParams"]): string {
  const parts: string[] = [];
  const q = firstParam(searchParams.q);
  const resolution = firstParam(searchParams.resolution);
  const orientation = firstParam(searchParams.orientation);
  if (q) {
    parts.push(q.charAt(0).toUpperCase() + q.slice(1));
  }
  if (resolution && RESOLUTIONS[resolution]) {
    parts.push(RESOLUTIONS[resolution].label);
  }
  if (orientation) {
    parts.push(orientation === "portrait" ? "phone" : orientation);
  }
  return parts.join(" ");
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const filterLabel = describeFilters(searchParams);
  const params = new URLSearchParams();
  ["q", "resolution", "orientation", "color", "sort"].forEach((key) => {
    const value = firstParam(searchParams[key]);
    if (value) {
      params.set(key, value);
    }
  });
  const canonical = params.toString()
    ? siteUrl + "/?" + params.toString()
    : siteUrl + "/";
  if (!filterLabel) {
    return { alternates: { canonical } };
  }
  const title = filterLabel + " Wallpapers - Free Downloads";
  const description =
    "Free " +
    filterLabel.toLowerCase() +
    " wallpapers with no download limits. Filter, check the file size and grab the full quality original.";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

async function pickFeatured(): Promise<Wallpaper | null> {
  try {
    const result = await fetchFeed({
      q: "landscape",
      resolution: "1080p",
      orientation: "landscape",
      color: "",
      source: "wallhaven",
      sort: "popular",
      page: 1,
    });
    const candidates = result.wallpapers.filter(
      (w) => w.width >= w.height && w.width >= 1920,
    );
    const light = candidates.find(
      (w) =>
        w.fileSizeBytes !== null &&
        w.fileSizeBytes < 1600000 &&
        w.width <= 4000,
    );
    return light || candidates[0] || result.wallpapers[0] || null;
  } catch (error) {
    return null;
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const hasFilters = ["q", "resolution", "orientation", "color", "sort"].some(
    (key) => firstParam(searchParams[key]),
  );
  const cms = await getCmsContent();
  const filterLabel = describeFilters(searchParams);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: cms.site && cms.site.name ? cms.site.name : "FEST",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: siteUrl + "/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const featured = hasFilters ? null : await pickFeatured();
  const rows =
    !hasFilters && cms.rows && Array.isArray(cms.rows) ? cms.rows : [];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {!hasFilters ? (
        <>
          <Hero
            content={
              cms.hero || {
                eyebrow: "",
                title: "One wall. No limits.",
                subtitle: "",
                ctaLabel: "Browse",
                ctaHref: "#gallery",
              }
            }
            featured={featured}
          />
          <div className="space-y-10 pb-4">
            {rows.map((row: any, index: number) => (
              <LazyRow
                key={String(row.id || index)}
                title={String(row.title || "")}
                query={String(row.query || "")}
                index={index}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-7xl px-5 pt-32 sm:px-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            {filterLabel ? filterLabel + " wallpapers" : "All wallpapers"}
          </h1>
          <p className="mt-2 max-w-xl text-sm opacity-65">
            Filtered to exactly what your screen needs, in original quality.
          </p>
        </div>
      )}
      <section
        className="mx-auto max-w-7xl px-5 pt-12 sm:px-8"
        aria-label="Wallpaper gallery"
      >
        {!hasFilters ? (
          <div className="mb-6 flex items-baseline gap-4 border-t border-current/[0.05] pt-6">
            <span className="font-heading text-xs font-extrabold tabular-nums opacity-30">
              {String(rows.length + 1).padStart(2, "0")}
            </span>
            <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              The full wall
            </h2>
          </div>
        ) : null}
        <Suspense fallback={<GridSkeleton count={15} />}>
          <FilterBar />
          <WallpaperGrid />
        </Suspense>
      </section>
    </main>
  );
}
