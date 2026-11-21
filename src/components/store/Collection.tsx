"use client";
/* eslint-disable @next/next/no-img-element */
import { useApi } from "@/lib/hooks";
import { bdt } from "@/lib/config";
import type { Product } from "@/lib/types";

function pick(id: string) {
  window.dispatchEvent(new CustomEvent("shathi:select-product", { detail: id }));
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
}

export default function Collection() {
  const { data, error, loading } = useApi<Product[]>("/api/products");

  return (
    <section id="collection" className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">The Shathi collection</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-forest md:text-5xl">Find your favourite jar.</h2>
          </div>
          <p className="max-w-xs text-ink/55 md:text-right">Choose Gold Ghee, silky Cream Ghee, or enjoy both together.</p>
        </div>

        {error && <p role="alert" className="mt-10 rounded-xl bg-white p-5 text-terracotta">We couldn&apos;t load the products. Please refresh the page.</p>}
        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-[34rem] animate-pulse rounded-[2rem] bg-sand/60" />)}
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {data?.map((p) => {
            const soldOut = p.inStock === false || p.stock <= 0;
            return (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_14px_36px_-22px_rgba(23,40,31,0.4)]">
                <div className="relative bg-sand p-3.5">
                  {p.badge && <span className="absolute left-5 top-5 z-10 rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-cream">{p.badge}</span>}
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white">
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain" />
                  </div>
                  <span className="absolute bottom-6 right-6 rounded-full bg-cream px-3 py-1 text-xs font-medium text-ink/70">{p.weightGrams}g</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-2xl font-semibold text-forest">{p.name}</h3>
                  <p className="mt-3 leading-relaxed text-ink/60">{p.description}</p>
                  <ul className="mt-5 space-y-2 text-[15px] text-ink/75">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex gap-2.5"><span aria-hidden className="text-gold">✓</span>{f}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between border-t border-line pt-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">Price</p>
                      <p className="font-serif text-3xl font-bold text-terracotta">{bdt(p.price)}</p>
                    </div>
                    <button type="button" disabled={soldOut} onClick={() => pick(p.id)} className="btn-primary !px-5 !py-2.5">
                      {soldOut ? "Sold out" : "Order now"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
