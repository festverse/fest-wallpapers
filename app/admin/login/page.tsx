"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Wrong email or password.");
      }
    } catch (err) {
      setError("Login failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 pt-20">
      <form onSubmit={submit} className="liquid-glass w-full max-w-sm px-7 py-8">
        <p className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-[0.18em]">
          <Lock size={16} strokeWidth={2} />
          MURAL ADMIN
        </p>
        <label htmlFor="admin-email" className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] opacity-60">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          className="mt-2 w-full rounded-xl bg-black/15 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-white/25 dark:bg-black/30"
        />
        <label htmlFor="admin-password" className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] opacity-60">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl bg-black/15 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-white/25 dark:bg-black/30"
        />
        {error ? <p className="mt-3 text-xs font-semibold text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-ink-950 disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {busy ? <Loader2 size={15} strokeWidth={2.2} className="animate-spin" /> : null}
          Sign in
        </button>
      </form>
    </main>
  );
}
