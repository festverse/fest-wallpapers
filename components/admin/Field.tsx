"use client";

export function Field({
  label,
  value,
  onChange,
  textarea
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  const id = "field-" + label.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.16em] opacity-60">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl bg-black/15 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-white/25 dark:bg-black/30"
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-xl bg-black/15 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-white/25 dark:bg-black/30"
        />
      )}
    </div>
  );
}

export function SaveButton({ busy, saved, onClick }: { busy: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-xl px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-ink-950 disabled:opacity-60"
      style={{ background: "var(--accent)" }}
    >
      {busy ? "Saving" : saved ? "Saved" : "Save changes"}
    </button>
  );
}
