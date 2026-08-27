"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Blocks, ImagePlus, ListTree, Globe, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Site content", icon: LayoutDashboard },
  { href: "/admin/builder", label: "Page builder", icon: Blocks },
  { href: "/admin/media", label: "Media library", icon: ImagePlus },
  { href: "/admin/menus", label: "Menus", icon: ListTree },
  { href: "/admin/seo", label: "SEO", icon: Globe }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-16 pt-24 sm:px-6">
      <aside className="liquid-glass sticky top-24 hidden h-fit w-56 shrink-0 flex-col p-3 md:flex">
        <nav aria-label="Admin" className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors " +
                  (active ? "text-ink-950" : "opacity-70 hover:bg-white/5 hover:opacity-100")
                }
                style={active ? { background: "var(--accent)" } : undefined}
              >
                <Icon size={16} strokeWidth={1.9} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold opacity-60 transition-opacity hover:opacity-100"
        >
          <LogOut size={16} strokeWidth={1.9} />
          Sign out
        </button>
      </aside>
      <div className="min-w-0 flex-1">
        <nav aria-label="Admin mobile" className="liquid-glass mb-5 flex gap-1 overflow-x-auto p-2 md:hidden">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "shrink-0 rounded-lg px-3 py-2 text-xs font-bold " +
                  (active ? "text-ink-950" : "opacity-70")
                }
                style={active ? { background: "var(--accent)" } : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </div>
  );
}
