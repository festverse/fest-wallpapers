"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { loadCms, saveCms } from "@/lib/admin-client";
import { Field, SaveButton } from "@/components/admin/Field";

async function resizeToDataUrl(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("canvas unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("image load failed"));
    image.src = url;
  });
}

export default function AdminSeoPage() {
  const [cms, setCms] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [faviconBusy, setFaviconBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadCms().then(setCms).catch(() => setCms(null));
  }, []);

  if (!cms) {
    return <div className="shimmer h-64 rounded-2xl" />;
  }

  const seo = cms.seo || {};

  const update = (key: string, value: any) => {
    setCms({ ...cms, seo: { ...seo, [key]: value } });
    setSaved(false);
  };

  const save = async () => {
    setBusy(true);
    const ok = await saveCms(cms);
    setBusy(false);
    setSaved(ok);
  };

  const handleFavicon = async (file: File) => {
    if (!file) {
      return;
    }
    setFaviconBusy(true);
    try {
      const [i48, i180, i192, i512] = await Promise.all([
        resizeToDataUrl(file, 48),
        resizeToDataUrl(file, 180),
        resizeToDataUrl(file, 192),
        resizeToDataUrl(file, 512)
      ]);
      setCms({ ...cms, seo: { ...seo, icons: { i48, apple: i180, i192, i512 } } });
      setSaved(false);
    } finally {
      setFaviconBusy(false);
    }
  };

  const icons = seo.icons || {};

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold">Global SEO</h1>
      <section className="liquid-glass space-y-4 p-6">
        <Field label="Site title" value={seo.title || ""} onChange={(v) => update("title", v)} />
        <Field label="Meta description" textarea value={seo.description || ""} onChange={(v) => update("description", v)} />
        <Field label="OG image URL" value={seo.ogImage || ""} onChange={(v) => update("ogImage", v)} />
        <Field label="Canonical base URL" value={seo.canonicalBase || ""} onChange={(v) => update("canonicalBase", v)} />
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={Boolean(seo.noindex)}
            onChange={(event) => update("noindex", event.target.checked)}
            className="h-4 w-4"
          />
          Discourage search engines from indexing this site
        </label>
      </section>
      <section className="liquid-glass space-y-4 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Favicon</h2>
        <p className="text-sm opacity-60">
          Upload one square image. It is regenerated at 48, 180, 192 and 512 pixels and applied across the site after saving.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files && event.target.files[0];
            if (file) {
              handleFavicon(file);
            }
            event.target.value = "";
          }}
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.click();
              }
            }}
            disabled={faviconBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-black/15 px-5 py-3 text-sm font-bold dark:bg-white/10"
          >
            {faviconBusy ? <Loader2 size={15} strokeWidth={2.2} className="animate-spin" /> : <Upload size={15} strokeWidth={2.2} />}
            Upload favicon
          </button>
          {icons.i192 ? (
            <img src={icons.i192} alt="Favicon preview" loading="lazy" className="h-12 w-12 rounded-xl" />
          ) : null}
        </div>
      </section>
      <SaveButton busy={busy} saved={saved} onClick={save} />
    </div>
  );
}
