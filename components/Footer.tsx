import Link from "next/link";

interface MenuItem {
  id: string;
  label: string;
  href: string;
}

export default function Footer({ text, menu, siteName }: { text: string; menu: MenuItem[]; siteName: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-ink-100/60 px-5 py-14 dark:border-ink-800">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[2fr,1fr]">
        <div>
          <p className="font-heading text-3xl font-extrabold tracking-[0.22em]">{siteName}</p>
          {text ? <p className="mt-4 max-w-md text-sm leading-relaxed opacity-65">{text}</p> : null}
        </div>
        <nav aria-label="Browse">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] opacity-50">Browse</p>
          <ul className="mt-4 space-y-2">
            {menu.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-sm opacity-70 transition-opacity hover:opacity-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-xs opacity-40">
        {year} {siteName}. Images belong to their original creators.
      </p>
    </footer>
  );
}
