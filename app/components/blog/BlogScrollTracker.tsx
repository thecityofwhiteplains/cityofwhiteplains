"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/app/lib/analyticsClient";

const THRESHOLDS = [25, 50, 75, 100];

type Props = {
  slug: string;
};

export default function BlogScrollTracker({ slug }: Props) {
  const sent = useRef<Set<number>>(new Set());

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = doc.scrollTop || body.scrollTop;
      const scrollHeight = doc.scrollHeight || body.scrollHeight;
      const clientHeight = doc.clientHeight || window.innerHeight;
      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) return;
      const pct = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));

      THRESHOLDS.forEach((threshold) => {
        if (pct >= threshold && !sent.current.has(threshold)) {
          sent.current.add(threshold);
          trackEvent("blog_scroll", { slug, depth: threshold });
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check in case of short pages
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  return null;
}
