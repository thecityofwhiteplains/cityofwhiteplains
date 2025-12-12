"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PROMO_CARD } from "@/app/lib/constants";
import type { PromoCardSettings } from "@/app/lib/homepageSettings";

type FloatingPromoCardProps = {
  promoCard?: PromoCardSettings | null;
};

export default function FloatingPromoCard({ promoCard }: FloatingPromoCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Light delay on initial reveal to avoid overwhelming the page
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !visible) return null;

  const promo = {
    imageUrl: promoCard?.imageUrl?.trim() || DEFAULT_PROMO_CARD.imageUrl,
    title: promoCard?.title?.trim() || DEFAULT_PROMO_CARD.title,
    buttonText: promoCard?.buttonText?.trim() || DEFAULT_PROMO_CARD.buttonText,
    buttonUrl: promoCard?.buttonUrl?.trim() || DEFAULT_PROMO_CARD.buttonUrl,
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[260px] max-w-[75vw] animate-[slideInUp_300ms_ease-out] drop-shadow-2xl md:bottom-6 md:left-6">
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 text-[#111827] shadow-2xl backdrop-blur transition hover:-translate-y-0.5 hover:shadow-emerald-100/40">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-xs text-[#4B5563] transition hover:bg-black/10"
          aria-label="Close promo card"
        >
          ×
        </button>
        <div className="overflow-hidden">
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="h-32 w-full object-cover"
          />
        </div>
        <div className="space-y-2 bg-white/45 px-3 py-3 backdrop-blur-md">
          <p className="text-sm font-semibold leading-snug text-[#111827]">
            {promo.title}
          </p>
          <a
            href={promo.buttonUrl || "#"}
            className="mx-auto inline-flex items-center justify-center rounded-full bg-[#1C1F2A] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-black"
          >
            {promo.buttonText}
          </a>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
