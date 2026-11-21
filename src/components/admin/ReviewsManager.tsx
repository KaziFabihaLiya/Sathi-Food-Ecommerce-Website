"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Review } from "@/lib/types";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ReviewsManager() {
  const { data, error, loading, reload } = useApi<Review[]>("/api/admin/reviews");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && (!OK_TYPES.includes(f.type) || f.size > 3 * 1024 * 1024)) {
      setMsg({ ok: false, text: "Use a JPG, PNG or WebP image under 3MB." });
      e.target.value = ""; setFile(null); return;
    }
    setMsg(null); setFile(f);
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMsg({ ok: false, text: "Choose an image first." });
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (caption.trim()) fd.append("caption", caption.trim());
      await api("/api/admin/reviews", { method: "POST", body: fd });
      setFile(null); setCaption("");
      setFileKey((k) => k + 1);
      setMsg({ ok: true, text: "Review image added." });
      await reload();
    } catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
    finally { setBusy(false); }
  }

  async function toggle(r: Review) {
    try { await api("/api/admin/reviews", { method: "PATCH", body: JSON.stringify({ id: r.id, active: !r.active }) }); await reload(); }
    catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
  }

  async function remove(r: Review) {
    if (!window.confirm("Remove this review image? This can't be undone.")) return;
    try { await api("/api/admin/reviews", { method: "DELETE", body: JSON.stringify({ id: r.id }) }); await reload(); }
    catch (err) { setMsg({ ok: false, text: (err as Error).message }); }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">Customer feedback</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold text-forest">Manage reviews</h1>
      <p className="mt-3 text-muted">Images shown in the storefront review carousel.</p>

      <form onSubmit={upload} className="panel mt-8 grid items-end gap-4 p-6 md:grid-cols-[1fr_1fr_auto]">
        <div><label htmlFor="r-file" className="label">Review image</label><input key={fileKey} id="r-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="text-sm" /></div>
        <div><label htmlFor="r-cap" className="label">Caption (optional)</label><input id="r-cap" className="field bg-white" value={caption} onChange={(e) => setCaption(e.target.value)} /></div>
        <button type="submit" disabled={busy} className="btn-dark">{busy ? "Uploading..." : "Add image"}</button>
      </form>
      {msg && <p role="status" className={`mt-3 text-sm ${msg.ok ? "text-forest" : "text-terracotta"}`}>{msg.text}</p>}
      {error && <p role="alert" className="mt-6 text-terracotta">{error}</p>}
      {loading && <p className="mt-6 text-muted">Loading...</p>}
      {data && data.length === 0 && <p className="mt-8 text-muted">No review images yet. Add your first one above.</p>}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((r) => (
          <li key={r.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="flex h-64 items-center justify-center bg-parchment"><img src={r.imageUrl} alt={r.caption || "Review"} className="max-h-full max-w-full object-contain" /></div>
            <div className="space-y-3 p-4">
              {r.caption && <p className="text-sm text-muted">{r.caption}</p>}
              <label className="flex items-center gap-2 text-sm text-forest">
                <input type="checkbox" checked={r.active} onChange={() => toggle(r)} className="h-4 w-4 accent-forest" />Show in carousel
              </label>
              <button type="button" onClick={() => remove(r)} className="text-sm font-medium text-terracotta hover:underline">Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
