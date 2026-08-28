"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface MenuItem {
  id: string;
  label: string;
  href: string;
}

export default function Header({ logoText, menu }: { logoText: string; menu: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const router = useRouter();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = term.trim();
    if (value.length > 0) {
      router.push("/?q=" + encodeURIComponent(value) + "#gallery");
      setOpen(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="liquid-glass liquid-glass-strong mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link href="/" aria-label={logoText + " home"} className="flex items-baseline gap-1">
          <span className="font-heading text-lg font-extrabold tracking-[0.22em] sm:text-xl">{logoText}</span>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
        </Link>
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-5 md:flex">
          {menu.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-sm font-medium opacity-75 transition-opacity hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={submit} role="search" className="ml-auto hidden min-w-0 items-center gap-2 sm:flex">
          <label htmlFor="site-search" className="sr-only">
            Search wallpapers
          </label>
          <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 dark:bg-black/30">
            <Search size={15} strokeWidth={1.8} className="opacity-60" />
            <input
              id="site-search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search wallpapers"
              className="w-40 bg-transparent text-sm outline-none placeholder:opacity-50 lg:w-56"
            />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center md:hidden"
          >
            {open ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="liquid-glass liquid-glass-strong mx-auto mt-2 max-w-7xl px-5 py-4 md:hidden">
          <form onSubmit={submit} role="search" className="mb-3 flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 dark:bg-black/30">
            <Search size={15} strokeWidth={1.8} className="opacity-60" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search wallpapers"
              aria-label="Search wallpapers"
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
            />
          </form>
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {menu.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium opacity-80 hover:opacity-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
