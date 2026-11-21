"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/lib/hooks";
import type { Review } from "@/lib/types";

export default function ReviewsCarousel() {
  const { data } = useApi<Review[]>("/api/reviews");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  const touchX = useRef<number | null>(null);
  const n = data?.length ?? 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const go = useCallback((d: number) => setI((c) => (n ? (c + d + n) % n : 0)), [n]);

  useEffect(() => {
    if (n < 2 || paused || reduced) return;
    const t = setInterval(() => go(1), 4500);
    return () => clearInterval(t);
  }, [n, paused, reduced, go]);

  if (!data || n === 0) return null;

  return (
    <section id="reviews" className="bg-parchment py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
        <p className="eyebrow">From our customers</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold text-forest md:text-5xl">Loved in real Bangladeshi homes.</h2>
        <p className="mx-auto mt-8 flex max-w-md items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold" aria-hidden>
          <span className="h-px flex-1 bg-gold/40" />What our customers say<span className="h-px flex-1 bg-gold/40" />
        </p>

        <div
          className="mx-auto mt-8 max-w-[19rem] sm:max-w-[21rem]"
          role="region" aria-roledescription="carousel" aria-label="Customer reviews"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
          onTouchEnd={(e) => {
            if (touchX.current !== null) {
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            }
            touchX.current = null; setPaused(false);
          }}
        >
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_36px_-20px_rgba(23,40,31,0.45)]">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
              {data.map((r, idx) => (
                <div key={r.id} className="w-full shrink-0" aria-hidden={idx !== i} role="group" aria-label={`Review ${idx + 1} of ${n}`}>
                  <img src={r.imageUrl} alt={r.caption || `Customer feedback ${idx + 1}`} loading="lazy" className="h-auto w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm text-ink/50">Swipe through genuine customer feedback</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {data.map((r, idx) => (
            <button key={r.id} type="button" onClick={() => setI(idx)} aria-label={`Show review ${idx + 1}`} aria-current={idx === i}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-terracotta" : "w-2 bg-ink/20 hover:bg-ink/40"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
