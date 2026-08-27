"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check } from "lucide-react";

const RESOLUTION_OPTIONS = [
  { value: "", label: "Any" },
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "1440p", label: "1440p 2K" },
  { value: "4k", label: "4K" },
  { value: "8k", label: "8K" }
];

const ORIENTATION_OPTIONS = [
  { value: "", label: "Any" },
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" }
];

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "random", label: "Random" }
];

const COLOR_OPTIONS = [
  { value: "", label: "Any color", swatch: "linear-gradient(135deg,#e8a95c,#4a90d9,#66aa66)" },
  { value: "0066cc", label: "Blue", swatch: "#0066cc" },
  { value: "cc0000", label: "Red", swatch: "#cc0000" },
  { value: "669900", label: "Green", swatch: "#669900" },
  { value: "cc6633", label: "Orange", swatch: "#cc6633" },
  { value: "9966cc", label: "Violet", swatch: "#9966cc" },
  { value: "000000", label: "Black", swatch: "#000000" },
  { value: "ffffff", label: "White", swatch: "#ffffff" }
];

const CATEGORY_OPTIONS = ["nature", "space", "minimal", "city", "ocean", "forest", "neon", "cars", "anime", "dark"];

function Segment({
  legend,
  options,
  current,
  onPick
}: {
  legend: string;
  options: { value: string; label: string }[];
  current: string;
  onPick: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = current === option.value;
          return (
            <button
              key={option.value || "any"}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(option.value)}
              className={
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                (active
                  ? "text-ink-950"
                  : "bg-black/10 opacity-70 hover:opacity-100 dark:bg-white/10")
              }
              style={active ? { background: "var(--accent)" } : undefined}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const get = (key: string, fallback: string) => searchParams.get(key) || fallback;

  const apply = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && !(key === "sort" && value === "latest")) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? "/?" + qs + "#gallery" : "/#gallery", { scroll: false });
  };

  const activeCount = ["resolution", "orientation", "color", "sort", "q"].filter((k) =>
    searchParams.get(k)
  ).length;

  const panels = (
    <div className="space-y-5">
      <Segment legend="Resolution" options={RESOLUTION_OPTIONS} current={get("resolution", "")} onPick={(v) => apply("resolution", v)} />
      <Segment legend="Orientation" options={ORIENTATION_OPTIONS} current={get("orientation", "")} onPick={(v) => apply("orientation", v)} />
      <Segment legend="Sort" options={SORT_OPTIONS} current={get("sort", "latest")} onPick={(v) => apply("sort", v)} />
      <fieldset>
        <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Color</legend>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((option) => {
            const active = get("color", "") === option.value;
            return (
              <button
                key={option.value || "any"}
                type="button"
                aria-label={option.label}
                aria-pressed={active}
                onClick={() => apply("color", option.value)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 transition-transform hover:scale-110 dark:border-white/25"
                style={{ background: option.swatch }}
              >
                {active ? <Check size={13} strokeWidth={3} className="text-white mix-blend-difference" /> : null}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Category</legend>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((category) => {
            const active = get("q", "") === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => apply("q", active ? "" : category)}
                className={
                  "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors " +
                  (active ? "text-ink-950" : "bg-black/10 opacity-70 hover:opacity-100 dark:bg-white/10")
                }
                style={active ? { background: "var(--accent)" } : undefined}
              >
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="liquid-glass hidden px-6 py-5 lg:block">{panels}</div>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="liquid-glass inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
        >
          <SlidersHorizontal size={15} strokeWidth={2} />
          Filters
          {activeCount > 0 ? (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-ink-950"
              style={{ background: "var(--accent)" }}
            >
              {activeCount}
            </span>
          ) : null}
        </button>
        {sheetOpen ? (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 bg-ink-950/60"
            />
            <div className="sheet-enter liquid-glass liquid-glass-strong absolute inset-y-3 right-3 w-[86vw] max-w-sm overflow-y-auto px-5 py-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-heading text-base font-bold">Filters</p>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setSheetOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 dark:bg-white/10"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              {panels}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
