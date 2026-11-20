import { useEffect, useState } from "react";

function probe(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export function useResolvedPhoto(primary: string, fallback: string) {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    probe(primary).then((ok) => {
      if (!cancelled && ok) setSrc(primary);
    });
    return () => {
      cancelled = true;
    };
  }, [primary, fallback]);

  return src;
}

export function useResolvedGallery<T extends { src: string }>(items: readonly T[]) {
  const [resolved, setResolved] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(items.map(async (item) => ((await probe(item.src)) ? item : null))).then((list) => {
      if (!cancelled) setResolved(list.filter(Boolean) as T[]);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  return resolved;
}
