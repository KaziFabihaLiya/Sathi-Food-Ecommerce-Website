"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { DISTRICTS, bdt } from "@/lib/config";
import type { Product } from "@/lib/types";

const PHONE_RE = /^01[3-9]\d{8}$/;
const empty = { name: "", phone: "", address: "", district: "", note: "", website: "" };

export default function OrderForm() {
  const { data: products, error: loadError } = useApi<Product[]>("/api/products");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ invoiceNo: string; total: number } | null>(null);

  useEffect(() => {
    const h = (e: Event) => { setProductId((e as CustomEvent<string>).detail); setQty(1); };
    window.addEventListener("shathi:select-product", h);
    return () => window.removeEventListener("shathi:select-product", h);
  }, []);

  const product = useMemo(
    () => products?.find((p) => p.id === productId) ?? products?.find((p) => p.stock > 0 && p.inStock !== false) ?? products?.[0],
    [products, productId],
  );
  const maxQty = Math.max(1, Math.min(20, product?.stock ?? 20));
  const q = Math.min(qty, maxQty);
  const total = (product?.price ?? 0) * q;
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!product) return;
    const phone = f.phone.replace(/\s|-/g, "");
    if (f.name.trim().length < 2) return setError("Please enter your full name.");
    if (!PHONE_RE.test(phone)) return setError("Enter a valid mobile number, like 01XXXXXXXXX.");
    if (f.address.trim().length < 5) return setError("Please enter your full delivery address.");
    if (!f.district) return setError("Please select your district.");
    setBusy(true);
    try {
      const res = await api<{ invoiceNo: string; total: number }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id, quantity: q, name: f.name.trim(), phone,
          address: f.address.trim(), district: f.district, note: f.note.trim() || undefined, website: f.website,
        }),
      });
      setDone(res);
      setF(empty);
      setQty(1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="panel p-8 text-center sm:p-10" role="status">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest text-xl text-cream">✓</span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-forest">Order Placed Successfully</h3>
        <p className="mt-3 text-ink/65">Order No: <strong className="text-forest">{done.invoiceNo}</strong></p>
        <p className="text-ink/65">Total (Cash on Delivery): <strong className="text-forest">{bdt(done.total)}</strong></p>
        <p className="mt-5 text-sm text-ink/55">We&apos;ll call you shortly to confirm your order.</p>
        <button type="button" onClick={() => setDone(null)} className="btn-light mt-6 !py-2">Place another order</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel space-y-5 p-6 sm:p-8" noValidate>
      {loadError && <p role="alert" className="text-sm text-terracotta">We couldn&apos;t load the products. Please refresh the page.</p>}

      <div>
        <label htmlFor="product" className="label">Product</label>
        <select id="product" className="field" value={product?.id ?? ""} onChange={(e) => { setProductId(e.target.value); setQty(1); }}>
          {products?.map((p) => (
            <option key={p.id} value={p.id} disabled={p.stock <= 0 || p.inStock === false}>
              {p.name} — {p.weightGrams}g ({bdt(p.price)}){p.stock <= 0 ? " · Sold out" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="label" id="qty-label">Quantity</span>
        <div className="flex items-center gap-3" role="group" aria-labelledby="qty-label">
          <button type="button" className="btn-sm !h-9 !w-9 !p-0 text-lg" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, q - 1))}>−</button>
          <span className="w-8 text-center font-medium" aria-live="polite">{q}</span>
          <button type="button" className="btn-sm !h-9 !w-9 !p-0 text-lg" aria-label="Increase quantity" onClick={() => setQty(Math.min(maxQty, q + 1))}>+</button>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="label">Full Name</label>
        <input id="name" className="field" placeholder="e.g. Rahim Uddin" autoComplete="name" value={f.name} onChange={set("name")} />
      </div>
      <div>
        <label htmlFor="phone" className="label">Mobile Number</label>
        <input id="phone" className="field" placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
      </div>
      <div>
        <label htmlFor="address" className="label">Delivery Address</label>
        <textarea id="address" rows={3} className="field" placeholder="House, road, area" autoComplete="street-address" value={f.address} onChange={set("address")} />
      </div>
      <div>
        <label htmlFor="district" className="label">District</label>
        <select id="district" className="field" value={f.district} onChange={set("district")}>
          <option value="">Select your district</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="label">Note (optional)</label>
        <input id="note" className="field" placeholder="Any delivery instructions" value={f.note} onChange={set("note")} />
      </div>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} /></label>
      </div>

      {error && <p role="alert" className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm text-terracotta">{error}</p>}

      <div className="flex items-center justify-between border-t border-line pt-5">
        <span className="text-sm text-muted">Total (Cash on Delivery)</span>
        <span className="font-serif text-2xl font-bold text-terracotta">{bdt(total)}</span>
      </div>
      <button type="submit" disabled={busy || !product} className="btn-primary w-full !py-3.5">
        {busy ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  );
}
