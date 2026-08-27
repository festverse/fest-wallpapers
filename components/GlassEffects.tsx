"use client";

import { useEffect } from "react";

export default function GlassEffects() {
  useEffect(() => {
    let raf = 0;
    let lastEvent: MouseEvent | null = null;

    const apply = () => {
      raf = 0;
      if (!lastEvent) {
        return;
      }
      const target = lastEvent.target;
      if (!(target instanceof Element)) {
        return;
      }
      const glass = target.closest<HTMLElement>(".liquid-glass");
      if (!glass) {
        return;
      }
      const rect = glass.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        return;
      }
      const x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((lastEvent.clientY - rect.top) / rect.height) * 100;
      glass.style.setProperty("--spec-x", Math.max(-40, Math.min(140, x)) + "%");
      glass.style.setProperty("--spec-y", Math.max(-40, Math.min(140, y)) + "%");
    };

    const handler = (event: MouseEvent) => {
      lastEvent = event;
      if (!raf) {
        raf = window.requestAnimationFrame(apply);
      }
    };

    if (typeof window !== "undefined" && window.matchMedia) {
      const fine = window.matchMedia("(pointer: fine)");
      if (fine && fine.matches) {
        window.addEventListener("mousemove", handler, { passive: true });
      }
    }
    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      window.removeEventListener("mousemove", handler);
    };
  }, []);
  return null;
}
