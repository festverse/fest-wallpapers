import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="font-heading text-7xl font-extrabold opacity-20">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold">That wall is bare</h1>
      <p className="mt-3 text-sm opacity-65">
        The wallpaper you were after has moved or its source took it down. The rest of the wall is still full.
      </p>
      <Link
        href="/"
        className="liquid-glass mt-8 inline-flex px-6 py-3 text-sm font-bold uppercase tracking-[0.14em]"
      >
        Back to the wall
      </Link>
    </main>
  );
}
