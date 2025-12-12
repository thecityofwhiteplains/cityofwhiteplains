"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/app/lib/analyticsClient";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/visit", label: "Visit" },
  { href: "/events", label: "Events" },
  { href: "/eat-drink", label: "Eat & Drink" },
  { href: "/business", label: "Business" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { title: string; href: string; type: string; snippet?: string | null }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isBlogActive = pathname.startsWith("/blog");

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }

    if (searchOpen) {
      window.addEventListener("keydown", handleEsc);
    } else {
      window.removeEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [searchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    searchAbort.current?.abort();
    searchAbort.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.warn("Search failed", err);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#ECEEF3] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        {/* Left: Logo + primary nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#1C1F2A] text-xs font-bold text-white">
              WP
            </span>
            <span className="text-sm font-semibold text-[#1C1F2A]">
              CityOfWhitePlains.org
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  isActive(link.href)
                    ? "bg-[#EEF0FF] text-[#4B5FC6]"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: WP Insider Blog + search + list business */}
        <div className="hidden items-center gap-2 md:flex">
          {/* WP Insider Blog button with its own warm accent, highlighted when active */}
          <Link
            href="/blog"
            className={[
              "rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm transition",
              isBlogActive
                ? "bg-[#FDBA74] text-[#7C2D12]" // stronger when active
                : "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5]",
            ].join(" ")}
          >
            WP Insider Blog
          </Link>

          {/* Search placeholder */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[11px] text-[#4B5563] hover:bg-[#F3F4F6]"
          >
            Search
          </button>

          {/* List your business CTA */}
          <Link
            href="/list-your-business"
            className="rounded-full bg-[#1C1F2A] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
          >
            List your business
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-[#E5E7EB] p-1.5 text-[#111827] md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-0.5">
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
            <span className="block h-0.5 w-4 rounded-full bg-current" />
          </div>
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-[#ECEEF3] bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "rounded-lg px-3 py-2 font-medium transition",
                  isActive(link.href)
                    ? "bg-[#EEF0FF] text-[#4B5FC6]"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]",
                ].join(" ")}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-2 border-[#E5E7EB]" />

            <Link
              href="/blog"
              className={[
                "rounded-lg px-3 py-2 text-[11px] font-semibold transition",
                isBlogActive
                  ? "bg-[#FDBA74] text-[#7C2D12]"
                  : "bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5]",
              ].join(" ")}
              onClick={() => setMobileOpen(false)}
            >
              WP Insider Blog
            </Link>

            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
                setMobileOpen(false);
              }}
              className="mt-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-[11px] text-left text-[#4B5563] hover:bg-[#F3F4F6]"
            >
              Search
            </button>

            <Link
              href="/list-your-business"
              className="mt-1 rounded-lg bg-[#1C1F2A] px-3 py-2 text-[11px] font-semibold text-white hover:bg-black"
              onClick={() => setMobileOpen(false)}
            >
              List your business
            </Link>
          </nav>
        </div>
      )}

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 px-4 py-10 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSearchOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#111827]">Search the site</p>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-[11px] text-[#6B7280] hover:text-[#111827]"
              >
                Esc
              </button>
            </div>
            <div className="mt-3">
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#4B5FC6]"
                placeholder="Try “events”, “coffee”, “blog”, or a business name"
              />
            </div>
            <div className="mt-4 max-h-80 overflow-y-auto">
              {loading && (
                <p className="text-[11px] text-[#6B7280]">Searching…</p>
              )}
              {!loading && results.length === 0 && query.length >= 2 && (
                <p className="text-[11px] text-[#9CA3AF]">No results found.</p>
              )}
              {!loading && results.length === 0 && query.length < 2 && (
                <p className="text-[11px] text-[#9CA3AF]">
                  Type at least 2 characters to search.
                </p>
              )}
              <ul className="space-y-2">
                {results.map((item) => (
                  <li key={`${item.type}-${item.href}`}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setSearchOpen(false);
                        trackEvent("page_view", { route: item.href, action: "search_click" });
                      }}
                      className="block rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm hover:border-[#4B5FC6]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111827]">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">
                          {item.type}
                        </span>
                      </div>
                      {item.snippet && (
                        <p className="mt-1 text-[11px] text-[#6B7280] line-clamp-2">
                          {item.snippet}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
