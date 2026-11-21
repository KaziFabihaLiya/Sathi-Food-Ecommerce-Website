"use client";
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { bdt } from "@/lib/config";
import type { Product } from "@/lib/types";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];

function Editor({ product, onSaved, onClose }: { product: Product; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({
    name: product.name, tagline: product.tagline, description: product.description,
    features: product.features.join("\n"), price: String(product.price),
    weightGrams: String(product.weightGrams), stock: String(product.stock), active: product.active,
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : product.imageUrl), [file, product.imageUrl]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && (!OK_TYPES.includes(file.type) || file.size > 3 * 1024 * 1024)) {
      setMsg({ ok: false, text: "Use a JPG, PNG or WebP image under 3MB." });
      e.target.value = ""; setFile(null); return;
    }
    setMsg(null); setFile(file);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: f.name.trim(), tagline: f.tagline.trim(), description: f.description.trim(),
          features: f.features.split("\n").map((s) => s.trim()).filter(Boolean),
          price: Number(f.price), weightGrams: Number(f.weightGrams), stock: Number(f.stock), active: f.active,
        }),
      });
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        await api(`/api/admin/products/${product.id}/image`, { method: "POST", body: fd });
        setFile(null);
      }
      setMsg({ ok: true, text: "Changes saved." });
      onSaved();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="panel space-y-5 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-forest">Edit {product.name}</h2>
        <button type="button" onClick={onClose} className="text-sm font-medium text-terracotta hover:underline">Close</button>
      </div>
      <div><label htmlFor="p-name" className="label">Name</label><input id="p-name" required className="field bg-white" value={f.name} onChange={set("name")} /></div>
      <div><label htmlFor="p-tag" className="label">Tagline</label><input id="p-tag" className="field bg-white" value={f.tagline} onChange={set("tagline")} /></div>
      <div><label htmlFor="p-desc" className="label">Description</label><textarea id="p-desc" rows={4} className="field bg-white" value={f.description} onChange={set("description")} /></div>
      <div><label htmlFor="p-feat" className="label">Features <span className="font-normal text-muted">(one per line)</span></label><textarea id="p-feat" rows={4} className="field bg-white" value={f.features} onChange={set("features")} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label htmlFor="p-price" className="label">Price (৳)</label><input id="p-price" type="number" min={0} required className="field bg-white" value={f.price} onChange={set("price")} /></div>
        <div><label htmlFor="p-weight" className="label">Weight (g)</label><input id="p-weight" type="number" min={1} required className="field bg-white" value={f.weightGrams} onChange={set("weightGrams")} /></div>
        <div><label htmlFor="p-stock" className="label">Stock</label><input id="p-stock" type="number" min={0} required className="field bg-white" value={f.stock} onChange={set("stock")} /></div>
      </div>
      <div>
        <label htmlFor="p-img" className="label">Replace image</label>
        <input id="p-img" type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="text-sm" />
        <img src={preview} alt="" className="mt-3 h-20 w-20 rounded-xl border border-line object-cover" />
      </div>
      <label className="flex items-center gap-2 text-sm text-forest">
        <input type="checkbox" checked={f.active} onChange={(e) => setF((s) => ({ ...s, active: e.target.checked }))} className="h-4 w-4 accent-forest" />
        Show this product on storefront
      </label>
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-forest" : "text-terracotta"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy} className="btn-dark">{busy ? "Saving..." : "Save changes"}</button>
    </form>
  );
}

export default function ProductsManager() {
  const { data, error, loading, reload } = useApi<Product[]>("/api/admin/products");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data?.find((p) => p.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-forest">Manage products</h1>
      <p className="mt-3 text-muted">Edit, restock, and hide products without affecting order history.</p>
      {error && <p role="alert" className="mt-6 text-terracotta">{error}</p>}
      {loading && <p className="mt-6 text-muted">Loading...</p>}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <section className="panel overflow-hidden">
          <div className="p-6">
            <h2 className="font-serif text-2xl font-semibold text-forest">Existing products</h2>
            <p className="mt-1 text-sm text-muted">Edit the catalogue details below. Adding new products is disabled.</p>
          </div>
          <ul>
            {data?.map((p) => (
              <li key={p.id} className="flex items-center gap-4 border-t border-line px-6 py-4">
                <img src={p.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-line bg-white object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest">{p.name}</p>
                  <p className="text-sm text-muted">{bdt(p.price)} · {p.weightGrams}g · {p.stock} in stock</p>
                  <p className="text-sm text-ink">{p.active ? "Active on storefront" : "Hidden from storefront"}</p>
                </div>
                <button type="button" onClick={() => setSelectedId(p.id)} className="btn-sm">Edit</button>
              </li>
            ))}
          </ul>
        </section>
        {selected && <Editor key={selected.id} product={selected} onSaved={reload} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}
