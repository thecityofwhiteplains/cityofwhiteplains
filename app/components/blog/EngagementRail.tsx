"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/app/lib/analyticsClient";

type Props = {
  title: string;
  slug: string;
};

export default function EngagementRail({ title, slug }: Props) {
  const [copied, setCopied] = useState(false);
  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [saving, setSaving] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch(`/api/reactions?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        setUpVotes(data.upVotes ?? 0);
        setDownVotes(data.downVotes ?? 0);
        setShareCount(data.shareCount ?? 0);
      } catch {
        // Ignore errors on initial load
      }
    }

    if (slug) {
      loadCounts();
    }
  }, [slug]);

  async function handleVote(direction: "up" | "down") {
    // Optimistic update for fast UI
    if (direction === "up") setUpVotes((v) => v + 1);
    if (direction === "down") setDownVotes((v) => v + 1);
    setSaving(direction);

    trackEvent("blog_reaction", { slug, direction });

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, direction }),
      });

      if (res.ok) {
        const data = await res.json();
        setUpVotes(data.upVotes ?? 0);
        setDownVotes(data.downVotes ?? 0);
      }
    } catch {
      // Roll back on failure
      if (direction === "up") setUpVotes((v) => Math.max(0, v - 1));
      if (direction === "down") setDownVotes((v) => Math.max(0, v - 1));
    } finally {
      setSaving(null);
    }
  }

  async function handleShare() {
    const url =
      typeof window !== "undefined" ? window.location.href : undefined;
    if (!url) return;

    // Optimistic increment for the visible counter
    setShareCount((c) => c + 1);

    trackEvent("blog_reaction", { slug, direction: "share" });

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* fall back to clipboard */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      // Roll back if both share + clipboard failed
      setShareCount((c) => Math.max(0, c - 1));
      return;
    }

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, direction: "share" }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareCount(data.shareCount ?? 0);
      }
    } catch {
      // If persistence fails, keep the optimistic count as a soft signal.
    }
  }

  return (
    <>
      {/* Desktop / tablet left rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col items-center gap-1.5 rounded-full bg-white/80 px-1.5 py-2.5 shadow-sm ring-1 ring-[#E5E7EB] transition">
          <ActionButton
            label="Thumbs up"
            badge={upVotes || undefined}
            onClick={() => handleVote("up")}
            disabled={saving === "up"}
          >
            👍
          </ActionButton>
          <ActionButton
            label="Thumbs down"
            badge={downVotes || undefined}
            onClick={() => handleVote("down")}
            disabled={saving === "down"}
          >
            👎
          </ActionButton>
          <ActionButton
            label="Share"
            badge={shareCount || undefined}
            onClick={handleShare}
          >
            {copied ? "✓" : "↗"}
          </ActionButton>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-2 z-30 flex items-center justify-center lg:hidden">
        <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/70 px-2.5 py-1.5 text-lg shadow-lg backdrop-blur-md">
          <ActionButton
            label="Thumbs up"
            badge={upVotes || undefined}
            onClick={() => handleVote("up")}
            disabled={saving === "up"}
          >
            👍
          </ActionButton>
          <ActionButton
            label="Thumbs down"
            badge={downVotes || undefined}
            onClick={() => handleVote("down")}
            disabled={saving === "down"}
          >
            👎
          </ActionButton>
          <ActionButton
            label="Share"
            badge={shareCount || undefined}
            onClick={handleShare}
          >
            {copied ? "✓" : "↗"}
          </ActionButton>
        </div>
      </div>
    </>
  );
}

type ActionButtonProps = {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  badge?: number;
  disabled?: boolean;
};

function ActionButton({
  label,
  onClick,
  children,
  badge,
  disabled = false,
}: ActionButtonProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group flex h-8 w-8 items-center justify-center rounded-full bg-[#F9FAFB] text-base shadow-sm ring-1 ring-[#E5E7EB] transition hover:-translate-y-0.5 hover:bg-white"
        aria-label={label}
      >
        {children}
      </button>
      {badge ? (
        <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#111827] px-1 text-center text-[10px] font-semibold text-white shadow-sm">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
