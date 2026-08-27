"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { loadCms, saveCms } from "@/lib/admin-client";
import { Field, SaveButton } from "@/components/admin/Field";

export default function AdminContentPage() {
  const [cms, setCms] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCms().then(setCms).catch(() => setCms(null));
  }, []);

  if (!cms) {
    return <div className="shimmer h-64 rounded-2xl" />;
  }

  const update = (path: string[], value: any) => {
    setCms((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      let node = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (!node[path[i]]) {
          node[path[i]] = {};
        }
        node = node[path[i]];
      }
      node[path[path.length - 1]] = value;
      return next;
    });
    setSaved(false);
  };

  const save = async () => {
    setBusy(true);
    const ok = await saveCms(cms);
    setBusy(false);
    setSaved(ok);
  };

  const rows = Array.isArray(cms.rows) ? cms.rows : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold">Site content</h1>
      <section className="liquid-glass space-y-4 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Identity</h2>
        <Field label="Site name" value={cms.site?.name || ""} onChange={(v) => update(["site", "name"], v)} />
        <Field label="Logo text" value={cms.site?.logoText || ""} onChange={(v) => update(["site", "logoText"], v)} />
        <Field label="Accent color" value={cms.site?.accentColor || ""} onChange={(v) => update(["site", "accentColor"], v)} />
      </section>
      <section className="liquid-glass space-y-4 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Hero</h2>
        <Field label="Eyebrow" value={cms.hero?.eyebrow || ""} onChange={(v) => update(["hero", "eyebrow"], v)} />
        <Field label="Title" value={cms.hero?.title || ""} onChange={(v) => update(["hero", "title"], v)} />
        <Field label="Subtitle" textarea value={cms.hero?.subtitle || ""} onChange={(v) => update(["hero", "subtitle"], v)} />
        <Field label="Button label" value={cms.hero?.ctaLabel || ""} onChange={(v) => update(["hero", "ctaLabel"], v)} />
        <Field label="Button link" value={cms.hero?.ctaHref || ""} onChange={(v) => update(["hero", "ctaHref"], v)} />
      </section>
      <section className="liquid-glass space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Category rows</h2>
          <button
            type="button"
            onClick={() => update(["rows"], [...rows, { id: crypto.randomUUID(), title: "New row", query: "sunset" }])}
            aria-label="Add row"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 dark:bg-white/10"
          >
            <Plus size={15} strokeWidth={2} />
          </button>
        </div>
        {rows.map((row: any, index: number) => (
          <div key={row.id} className="grid gap-3 rounded-xl bg-black/10 p-4 dark:bg-white/5 sm:grid-cols-[1fr,1fr,auto]">
            <Field
              label="Row title"
              value={row.title || ""}
              onChange={(v) => {
                const next = [...rows];
                next[index] = { ...row, title: v };
                update(["rows"], next);
              }}
            />
            <Field
              label="Search query"
              value={row.query || ""}
              onChange={(v) => {
                const next = [...rows];
                next[index] = { ...row, query: v };
                update(["rows"], next);
              }}
            />
            <button
              type="button"
              aria-label={"Delete row " + (row.title || "")}
              onClick={() => update(["rows"], rows.filter((r: any) => r.id !== row.id))}
              className="mt-7 flex h-10 w-10 items-center justify-center self-start rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
            >
              <Trash2 size={15} strokeWidth={1.9} />
            </button>
          </div>
        ))}
      </section>
      <section className="liquid-glass space-y-4 p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Footer</h2>
        <Field label="Footer text" textarea value={cms.footer?.text || ""} onChange={(v) => update(["footer", "text"], v)} />
      </section>
      <SaveButton busy={busy} saved={saved} onClick={save} />
    </div>
  );
}
