import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsContent } from "@/lib/cms";
import { fetchFeed } from "@/lib/aggregate";
import WallpaperCard from "@/components/WallpaperCard";
import { Wallpaper } from "@/lib/types";

export const runtime = "edge";

interface PageProps {
  params: { slug: string };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wallpaper-prosox-site.pages.dev";

async function findPage(slug: string): Promise<any | null> {
  const cms = await getCmsContent();
  const pages = Array.isArray(cms.pages) ? cms.pages : [];
  return pages.find((p: any) => p.slug === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await findPage(params.slug);
  if (!page) {
    return { title: "Page not found" };
  }
  const seo = page.seo || {};
  return {
    title: seo.title || page.title,
    description: seo.description || undefined,
    alternates: { canonical: seo.canonical || siteUrl + "/p/" + page.slug },
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: seo.ogImage ? { images: [{ url: seo.ogImage }] } : undefined
  };
}

async function GridWidget({ query, count }: { query: string; count: number }) {
  let wallpapers: Wallpaper[] = [];
  try {
    const result = await fetchFeed({
      q: query,
      resolution: "",
      orientation: "",
      color: "",
      source: "all",
      sort: "popular",
      page: 1
    });
    wallpapers = result.wallpapers.slice(0, count);
  } catch (error) {
    wallpapers = [];
  }
  if (wallpapers.length === 0) {
    return null;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {wallpapers.map((wallpaper, index) => (
        <WallpaperCard key={wallpaper.source + wallpaper.id} wallpaper={wallpaper} index={index} variant="grid" />
      ))}
    </div>
  );
}

function renderWidget(widget: any) {
  const props = widget.props || {};
  if (widget.type === "hero") {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-ink-850 px-8 py-16 text-bone-100 sm:px-12 sm:py-24">
        {props.image ? (
          <Image src={props.image} alt={props.title || "Section background"} fill quality={65} sizes="100vw" className="object-cover opacity-50" />
        ) : null}
        <div className="relative">
          <h2 className="font-heading text-3xl font-extrabold sm:text-5xl">{props.title}</h2>
          {props.subtitle ? <p className="mt-4 max-w-xl opacity-75">{props.subtitle}</p> : null}
        </div>
      </div>
    );
  }
  if (widget.type === "grid") {
    const count = Number(props.count) > 0 ? Math.min(Number(props.count), 24) : 8;
    return <GridWidget query={String(props.query || "wallpaper")} count={count} />;
  }
  if (widget.type === "text") {
    return (
      <div className="max-w-2xl">
        {props.heading ? <h2 className="font-heading text-2xl font-bold">{props.heading}</h2> : null}
        {props.body ? <p className="mt-3 leading-relaxed opacity-75">{props.body}</p> : null}
      </div>
    );
  }
  if (widget.type === "image") {
    if (!props.url) {
      return null;
    }
    return (
      <img src={props.url} alt={props.alt || "Content image"} loading="lazy" className="w-full rounded-3xl object-cover" />
    );
  }
  if (widget.type === "spacer") {
    const height = Number(props.height) > 0 ? Math.min(Number(props.height), 400) : 48;
    return <div style={{ height }} aria-hidden="true" />;
  }
  if (widget.type === "cta") {
    return (
      <Link
        href={props.href || "/"}
        className="liquid-glass inline-flex px-7 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em]"
      >
        {props.label || "Browse"}
      </Link>
    );
  }
  if (widget.type === "html") {
    if (!props.code) {
      return null;
    }
    return <div dangerouslySetInnerHTML={{ __html: String(props.code) }} />;
  }
  return null;
}

export default async function BuiltPage({ params }: PageProps) {
  const page = await findPage(params.slug);
  if (!page) {
    notFound();
  }
  const sections = Array.isArray(page.sections) ? page.sections : [];
  return (
    <main className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8">
      <h1 className="sr-only">{page.title}</h1>
      <div className="space-y-10">
        {sections.map((section: any) => (
          <section key={section.id} className="space-y-8">
            {(section.widgets || []).map((widget: any) => (
              <div key={widget.id}>{renderWidget(widget)}</div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
