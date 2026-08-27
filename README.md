# FEST - Wallpaper Site

Production Next.js 14 App Router wallpaper site powered by the Wallhaven API, which requires no API key and has no download quota. Deployed on Cloudflare Pages via next-on-pages.

## Stack

Next.js 14 App Router, TypeScript, Tailwind CSS (class dark mode), Lucide icons, Sora and Manrope via next/font, edge route handlers, Cloudflare KV for CMS storage, Cloudflare R2 for media uploads.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local`:

| Variable               | Purpose                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `SESSION_SECRET`       | Long random string signing the admin session cookie                                                               |
| `NEXT_PUBLIC_SITE_URL` | Canonical production URL                                                                                          |
| `ALPHACODERS_API_KEY`  | Optional. Free key from an Alphacoders account (about 100k queries per month); enables the Wallpaper Abyss source |

Wallhaven and the Reddit community feeds are keyless, so the site works with zero keys. All requests proxy through edge route handlers with s-maxage caching so end users never hit the upstream services directly, and any source that fails is skipped without breaking the feed.

## Admin

`/admin` is protected by middleware and an httpOnly signed session cookie. Sign in at `/admin/login`, then manage hero content, category rows, footer, header and footer menus (drag to reorder), the drag and drop page builder (pages publish at `/p/slug`), the media library, per page SEO and global SEO including favicon upload. Without KV bound, CMS edits persist in memory per server instance and reset on restart; with KV bound they are permanent.

## Cloudflare Pages deployment

1. Push to GitHub (`festverse/wallpaper-festverse-site`).
2. Cloudflare dashboard: Workers and Pages, Create, Pages, Connect to Git, pick the repo.
3. Framework preset: Next.js. Build command: `npx @cloudflare/next-on-pages@1`. Build output directory: `.vercel/output/static`.
4. Add the environment variables above under Settings, Environment variables.
5. Settings, Functions, Compatibility flags: add `nodejs_compat` for Production and Preview.
6. Bindings: create a KV namespace, bind it as `CMS_KV`; create an R2 bucket `wallpaper-festverse-media`, bind it as `MEDIA_R2`. Update the KV id in `wrangler.toml`.
7. Every push to `main` auto deploys.

Local Cloudflare preview:

```bash
npm run preview
```

## Performance notes

Grid thumbnails use Wallhaven's small thumb variant, large previews load only on detail pages, and downloads stream the full quality original through `/api/download` with a forced attachment disposition. `/api/filesize` reports the real Content-Length before download. Images reserve aspect ratio boxes, lazy load outside the first row, use dominant color placeholders, skip offscreen rendering via content-visibility, and paginate with IntersectionObserver.
