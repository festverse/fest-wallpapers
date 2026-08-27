"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { loadCms, saveCms } from "@/lib/admin-client";
import { Field, SaveButton } from "@/components/admin/Field";

function MenuEditor({
  title,
  items,
  onChange
}: {
  title: string;
  items: any[];
  onChange: (items: any[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
      return;
    }
    const next = [...items];
    const [taken] = next.splice(from, 1);
    next.splice(to, 0, taken);
    onChange(next);
  };

  return (
    <section className="liquid-glass space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.18em] opacity-60">{title}</h2>
        <button
          type="button"
          aria-label={"Add item to " + title}
          onClick={() => onChange([...items, { id: crypto.randomUUID(), label: "New link", href: "/" }])}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 dark:bg-white/10"
        >
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null) {
              move(dragIndex, index);
              setDragIndex(null);
            }
          }}
          className="grid gap-3 rounded-xl bg-black/10 p-4 dark:bg-white/5 sm:grid-cols-[auto,1fr,1fr,auto]"
        >
          <span className="mt-9 cursor-grab opacity-40" aria-hidden="true">
            <GripVertical size={16} strokeWidth={1.8} />
          </span>
          <Field
            label="Label"
            value={item.label || ""}
            onChange={(v) => {
              const next = [...items];
              next[index] = { ...item, label: v };
              onChange(next);
            }}
          />
          <Field
            label="Link"
            value={item.href || ""}
            onChange={(v) => {
              const next = [...items];
              next[index] = { ...item, href: v };
              onChange(next);
            }}
          />
          <button
            type="button"
            aria-label={"Delete " + (item.label || "item")}
            onClick={() => onChange(items.filter((m) => m.id !== item.id))}
            className="mt-7 flex h-10 w-10 items-center justify-center self-start rounded-full bg-black/15 opacity-70 hover:opacity-100 dark:bg-white/10"
          >
            <Trash2 size={15} strokeWidth={1.9} />
          </button>
        </div>
      ))}
    </section>
  );
}

export default function AdminMenusPage() {
  const [cms, setCms] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCms().then(setCms).catch(() => setCms(null));
  }, []);

  if (!cms) {
    return <div className="shimmer h-64 rounded-2xl" />;
  }

  const menus = cms.menus || { header: [], footer: [] };

  const setMenu = (key: string, items: any[]) => {
    setCms({ ...cms, menus: { ...menus, [key]: items } });
    setSaved(false);
  };

  const save = async () => {
    setBusy(true);
    const ok = await saveCms(cms);
    setBusy(false);
    setSaved(ok);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold">Menus</h1>
      <p className="text-sm opacity-60">Drag items to reorder. Changes go live after saving.</p>
      <MenuEditor title="Header menu" items={Array.isArray(menus.header) ? menus.header : []} onChange={(v) => setMenu("header", v)} />
      <MenuEditor title="Footer menu" items={Array.isArray(menus.footer) ? menus.footer : []} onChange={(v) => setMenu("footer", v)} />
      <SaveButton busy={busy} saved={saved} onClick={save} />
    </div>
  );
}
