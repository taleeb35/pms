import { useEffect, useRef, useState } from "react";

// Like useState, but the value is remembered on this device (filters, page size, sort),
// so a list opens the way the user left it. A value passed in `override` (e.g. from the URL) wins.
export function useStickyState<T>(key: string, fallback: T, override?: T | null) {
  const storageKey = `zonoir.sticky.${key}`;
  const [value, setValue] = useState<T>(() => {
    if (override !== undefined && override !== null) return override;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  });
  const fromUrl = useRef(override !== undefined && override !== null ? override : undefined);
  useEffect(() => {
    // A value that came from a link is used once, not remembered.
    if (fromUrl.current !== undefined && value === fromUrl.current) return;
    fromUrl.current = undefined;
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* ignore */ }
  }, [storageKey, value]);
  return [value, setValue] as const;
}

export const urlParam = (name: string): string | null =>
  typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get(name);
