import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import GlassFilter from "@/components/GlassFilter";
import GlassEffects from "@/components/GlassEffects";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCmsContent } from "@/lib/cms";

const sora = Sora({ subsets: ["latin"], display: "swap", variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wallpaper-prosox-site.pages.dev";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsContent();
  const seo = cms.seo || {};
  const title = seo.title || "MURAL - Free 4K and 8K Wallpapers, No Limits";
  const description =
    seo.description ||
    "Unlimited free wallpapers. Filter by resolution, orientation and color, see the real file size, then download the full quality original. No account, no quota.";
  const base = seo.canonicalBase || siteUrl;
  const customIcons = seo.icons || {};
  return {
    metadataBase: new URL(base),
    title: { default: title, template: "%s | MURAL" },
    description,
    applicationName: "MURAL",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: customIcons.i48 || "/icon.png", type: "image/png", sizes: "48x48" },
        { url: customIcons.i192 || "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: customIcons.i512 || "/icon-512.png", type: "image/png", sizes: "512x512" }
      ],
      apple: [{ url: customIcons.apple || "/apple-touch-icon.png", sizes: "180x180" }]
    },
    openGraph: {
      type: "website",
      siteName: "MURAL",
      url: base,
      title,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined
    },
    twitter: { card: "summary_large_image", title, description },
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true }
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090c" },
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" }
  ],
  width: "device-width",
  initialScale: 1
};

const themeScript =
  "(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':true;var r=document.documentElement;if(d){r.classList.add('dark');}else{r.classList.remove('dark');}}catch(e){document.documentElement.classList.add('dark');}})();";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cms = await getCmsContent();
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://th.wallhaven.cc" />
        <link rel="preconnect" href="https://w.wallhaven.cc" />
      </head>
      <body className={sora.variable + " " + manrope.variable + " font-body bg-ink-950 text-bone-100 dark:bg-ink-950 dark:text-bone-100"}>
        <div className="min-h-dvh bg-bone-50 text-ink-900 dark:bg-ink-950 dark:text-bone-100">
          <GlassFilter />
          <GlassEffects />
          <Header
            logoText={cms.site && cms.site.logoText ? cms.site.logoText : "MURAL"}
            menu={cms.menus && Array.isArray(cms.menus.header) ? cms.menus.header : []}
          />
          {children}
          <Footer
            text={cms.footer && cms.footer.text ? cms.footer.text : ""}
            menu={cms.menus && Array.isArray(cms.menus.footer) ? cms.menus.footer : []}
            siteName={cms.site && cms.site.name ? cms.site.name : "MURAL"}
          />
        </div>
      </body>
    </html>
  );
}
