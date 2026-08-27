"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Loader2 } from "lucide-react";
import { loadCms } from "@/lib/admin-client";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refresh = async () => {
    try {
      const cms = await loadCms();
      setMedia(Array.isArray(cms.media) ? cms.media : []);
    } catch (error) {
      setMedia([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const upload = async (file: File) => {
    if (!file) {
      return;
    }
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/cms/media", { method: "POST", body: form });
      if (res.ok) {
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!id) {
      return;
    }
    await fetch("/api/cms/media?id=" + encodeURIComponent(id), { method: "DELETE" });
    await refresh();
  };

  const copyUrl = (url: string) => {
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold">Media library</h1>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files && event.target.files[0];
            if (file) {
              upload(file);
            }
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.click();
            }
          }}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-ink-950 disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {busy ? <Loader2 size={15} strokeWidth={2.2} className="animate-spin" /> : <Upload size={15} strokeWidth={2.2} />}
          Upload image
        </button>
      </div>
      {loadingList ? <div className="shimmer h-48 rounded-2xl" /> : null}
      {!loadingList && media.length === 0 ? (
        <div className="liquid-glass px-8 py-12 text-center">
          <p className="font-heading text-lg font-bold">No uploads yet</p>
          <p className="mt-2 text-sm opacity-60">Images you upload land here and can be used in any builder widget.</p>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <figure key={item.id} className="liquid-glass overflow-hidden p-2">
            <img
              src={item.url}
              alt={item.name || "Uploaded media"}
              loading="lazy"
              className="aspect-video w-full rounded-xl object-cover"
            />
            <figcaption className="mt-2 truncate px-1 text-xs opacity-60">{item.name}</figcaption>
            <div className="mt-2 flex gap-1.5 px-1 pb-1">
              <button
                type="button"
                aria-label={"Copy URL for " + (item.name || "image")}
                onClick={() => copyUrl(item.url)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
              >
                <Copy size={13} strokeWidth={1.9} />
              </button>
              <button
                type="button"
                aria-label={"Delete " + (item.name || "image")}
                onClick={() => remove(item.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
              >
                <Trash2 size={13} strokeWidth={1.9} />
              </button>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
