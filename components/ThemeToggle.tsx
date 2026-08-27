"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggle = () => {
    if (typeof document === "undefined") {
      return;
    }
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="liquid-glass flex h-10 w-10 items-center justify-center text-current transition-transform hover:scale-105 active:scale-95"
      style={{ borderRadius: 20 }}
    >
      {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
    </button>
  );
}
