"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { bdtText, fmtDateTime } from "@/lib/config";
import { STATUSES, type OrderDetailData, type OrderStatus } from "@/lib/types";

export default function OrderDetail({ id }: { id: string }) {
  const { data: order, error, loading, reload } = useApi<OrderDetailData>(`/api/admin/orders/${id}`);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (loading) return <p className="mx-auto max-w-3xl px-5 py-10 text-muted">Loading...</p>;
  if (error || !order) return <p role="alert" className="mx-auto max-w-3xl px-5 py-10 text-terracotta">{error ?? "Order not found."}</p>;

  const current = status ?? order.status;

  async function save() {
    setBusy(true); setMsg(null);
    try {
      await api(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status: current }) });
      await reload(); setStatus(null);
      setMsg({ ok: true, text: "Status saved." });
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-forest">← Back to dashboard</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Cash on Delivery</p>
          <h1 className="font-serif text-4xl font-semibold text-forest">{order.invoiceNo}</h1>
          <p className="mt-1 text-sm text-muted">Placed {fmtDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Link href={`/admin/orders/${id}/invoice`} className="btn-sm">Print invoice</Link>
          <div className="flex items-end gap-2">
            <div>
              <label htmlFor="status" className="mb-1 block text-sm text-forest">Order status</label>
              <select id="status" value={current} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="button" onClick={save} disabled={busy || current === order.status} className="btn-dark !rounded-lg !px-4 !py-2 text-sm">{busy ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
      {current === "CANCELLED" && current !== order.status && <p className="mt-3 text-right text-sm text-muted">Cancelling returns the items to stock.</p>}
      {msg && <p role="status" className={`mt-3 text-right text-sm ${msg.ok ? "text-forest" : "text-terracotta"}`}>{msg.text}</p>}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-forest">Customer</h2>
          <p className="mt-4 font-medium text-ink">{order.customerName}</p>
          <p className="font-medium text-ink">{order.phone}</p>
          <p className="mt-3 whitespace-pre-line text-muted">{order.address}{"\n"}{order.district}</p>
          {order.note && <p className="mt-4 rounded-lg bg-cream px-4 py-3 text-sm"><strong>Note:</strong> {order.note}</p>}
        </section>
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-forest">Items</h2>
          <ul className="mt-4 space-y-2 border-b border-line pb-4">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between"><span>{it.productName} × {it.quantity}</span><span>{bdtText(it.unitPrice * it.quantity)}</span></li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between font-semibold text-forest"><span>Total</span><span>{bdtText(order.total)}</span></p>
        </section>
      </div>
    </div>
  );
}
