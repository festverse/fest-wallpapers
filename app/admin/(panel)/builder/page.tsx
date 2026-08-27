"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { loadCms, saveCms } from "@/lib/admin-client";
import { Field, SaveButton } from "@/components/admin/Field";

const WIDGET_TYPES = [
  { type: "hero", label: "Hero" },
  { type: "grid", label: "Wallpaper grid" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "spacer", label: "Spacer" },
  { type: "cta", label: "CTA" },
  { type: "html", label: "Custom HTML" }
];

function defaultProps(type: string): Record<string, string> {
  if (type === "hero") {
    return { title: "Section title", subtitle: "Supporting line", image: "" };
  }
  if (type === "grid") {
    return { query: "nature", count: "8" };
  }
  if (type === "text") {
    return { heading: "Heading", body: "Body text" };
  }
  if (type === "image") {
    return { url: "", alt: "Image" };
  }
  if (type === "spacer") {
    return { height: "48" };
  }
  if (type === "cta") {
    return { label: "Browse wallpapers", href: "/" };
  }
  return { code: "<div></div>" };
}

function WidgetEditor({
  widget,
  onChange,
  onDelete
}: {
  widget: any;
  onChange: (widget: any) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const props = widget.props || {};
  const setProp = (key: string, value: string) => {
    onChange({ ...widget, props: { ...props, [key]: value } });
  };
  return (
    <div className="rounded-xl bg-black/10 p-3 dark:bg-white/5">
      <div className="flex items-center gap-2">
        <GripVertical size={14} strokeWidth={1.8} className="cursor-grab opacity-40" aria-hidden="true" />
        <span className="text-xs font-extrabold uppercase tracking-[0.14em]">{widget.type}</span>
        <button
          type="button"
          aria-label={open ? "Collapse widget" : "Expand widget"}
          onClick={() => setOpen(!open)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/15 dark:bg-white/10"
        >
          {open ? <ChevronUp size={13} strokeWidth={2} /> : <ChevronDown size={13} strokeWidth={2} />}
        </button>
        <button
          type="button"
          aria-label="Delete widget"
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
        >
          <Trash2 size={13} strokeWidth={1.9} />
        </button>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          {Object.keys(props).map((key) => (
            <Field
              key={key}
              label={key}
              textarea={key === "body" || key === "code"}
              value={String(props[key] || "")}
              onChange={(v) => setProp(key, v)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminBuilderPage() {
  const [cms, setCms] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [drag, setDrag] = useState<{ section: string; index: number } | null>(null);

  useEffect(() => {
    loadCms().then(setCms).catch(() => setCms(null));
  }, []);

  if (!cms) {
    return <div className="shimmer h-64 rounded-2xl" />;
  }

  const pages = Array.isArray(cms.pages) ? cms.pages : [];
  const page = pages.find((p: any) => p.id === selectedId) || pages[0] || null;

  const setPages = (next: any[]) => {
    setCms({ ...cms, pages: next });
    setSaved(false);
  };

  const updatePage = (updated: any) => {
    setPages(pages.map((p: any) => (p.id === updated.id ? updated : p)));
  };

  const addPage = () => {
    const id = crypto.randomUUID();
    const fresh = {
      id,
      title: "New page",
      slug: "new-page-" + id.slice(0, 4),
      seo: { title: "", description: "", ogImage: "", canonical: "", noindex: false },
      sections: []
    };
    setPages([...pages, fresh]);
    setSelectedId(id);
  };

  const save = async () => {
    setBusy(true);
    const ok = await saveCms(cms);
    setBusy(false);
    setSaved(ok);
  };

  const sections = page && Array.isArray(page.sections) ? page.sections : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-extrabold">Page builder</h1>
        <button
          type="button"
          onClick={addPage}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-ink-950"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={15} strokeWidth={2.2} />
          New page
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {pages.map((p: any) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold " +
              (page && page.id === p.id ? "text-ink-950" : "bg-black/10 opacity-70 dark:bg-white/10")
            }
            style={page && page.id === p.id ? { background: "var(--accent)" } : undefined}
          >
            <FileText size={12} strokeWidth={2} />
            {p.title}
          </button>
        ))}
      </div>
      {!page ? (
        <div className="liquid-glass px-8 py-12 text-center">
          <p className="font-heading text-lg font-bold">No pages yet</p>
          <p className="mt-2 text-sm opacity-60">Create a page and compose it from sections and widgets. It publishes at /p/your-slug.</p>
        </div>
      ) : (
        <>
          <section className="liquid-glass space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Page settings</h2>
              <button
                type="button"
                aria-label="Delete page"
                onClick={() => {
                  setPages(pages.filter((p: any) => p.id !== page.id));
                  setSelectedId("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
              >
                <Trash2 size={15} strokeWidth={1.9} />
              </button>
            </div>
            <Field label="Page title" value={page.title || ""} onChange={(v) => updatePage({ ...page, title: v })} />
            <Field
              label="Slug"
              value={page.slug || ""}
              onChange={(v) => updatePage({ ...page, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
            />
          </section>
          <section className="liquid-glass space-y-4 p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">Page SEO</h2>
            <Field label="SEO title" value={page.seo?.title || ""} onChange={(v) => updatePage({ ...page, seo: { ...page.seo, title: v } })} />
            <Field label="SEO description" textarea value={page.seo?.description || ""} onChange={(v) => updatePage({ ...page, seo: { ...page.seo, description: v } })} />
            <Field label="OG image URL" value={page.seo?.ogImage || ""} onChange={(v) => updatePage({ ...page, seo: { ...page.seo, ogImage: v } })} />
            <Field label="Canonical URL" value={page.seo?.canonical || ""} onChange={(v) => updatePage({ ...page, seo: { ...page.seo, canonical: v } })} />
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={Boolean(page.seo?.noindex)}
                onChange={(event) => updatePage({ ...page, seo: { ...page.seo, noindex: event.target.checked } })}
                className="h-4 w-4"
              />
              noindex this page
            </label>
          </section>
          <div className="space-y-4">
            {sections.map((section: any, sectionIndex: number) => (
              <section key={section.id} className="liquid-glass space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-[0.18em] opacity-60">
                    Section {sectionIndex + 1}
                  </h3>
                  <div className="flex gap-1.5">
                    <select
                      aria-label="Add widget to section"
                      className="rounded-lg bg-black/15 px-2 py-1.5 text-xs font-bold dark:bg-ink-800"
                      value=""
                      onChange={(event) => {
                        const type = event.target.value;
                        if (!type) {
                          return;
                        }
                        const widget = { id: crypto.randomUUID(), type, props: defaultProps(type) };
                        const next = sections.map((s: any) =>
                          s.id === section.id ? { ...s, widgets: [...(s.widgets || []), widget] } : s
                        );
                        updatePage({ ...page, sections: next });
                      }}
                    >
                      <option value="">Add widget</option>
                      {WIDGET_TYPES.map((w) => (
                        <option key={w.type} value={w.type}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label="Delete section"
                      onClick={() => updatePage({ ...page, sections: sections.filter((s: any) => s.id !== section.id) })}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
                    >
                      <Trash2 size={13} strokeWidth={1.9} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(section.widgets || []).map((widget: any, widgetIndex: number) => (
                    <div
                      key={widget.id}
                      draggable
                      onDragStart={() => setDrag({ section: section.id, index: widgetIndex })}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (drag && drag.section === section.id && drag.index !== widgetIndex) {
                          const widgets = [...section.widgets];
                          const [taken] = widgets.splice(drag.index, 1);
                          widgets.splice(widgetIndex, 0, taken);
                          updatePage({
                            ...page,
                            sections: sections.map((s: any) => (s.id === section.id ? { ...s, widgets } : s))
                          });
                        }
                        setDrag(null);
                      }}
                    >
                      <WidgetEditor
                        widget={widget}
                        onChange={(updated) =>
                          updatePage({
                            ...page,
                            sections: sections.map((s: any) =>
                              s.id === section.id
                                ? { ...s, widgets: s.widgets.map((w: any) => (w.id === updated.id ? updated : w)) }
                                : s
                            )
                          })
                        }
                        onDelete={() =>
                          updatePage({
                            ...page,
                            sections: sections.map((s: any) =>
                              s.id === section.id
                                ? { ...s, widgets: s.widgets.filter((w: any) => w.id !== widget.id) }
                                : s
                            )
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <button
              type="button"
              onClick={() =>
                updatePage({ ...page, sections: [...sections, { id: crypto.randomUUID(), widgets: [] }] })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-black/15 px-5 py-3 text-sm font-bold dark:bg-white/10"
            >
              <Plus size={15} strokeWidth={2.2} />
              Add section
            </button>
          </div>
        </>
      )}
      <SaveButton busy={busy} saved={saved} onClick={save} />
    </div>
  );
}
