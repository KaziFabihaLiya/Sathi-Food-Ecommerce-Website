"use client";
import { IMG } from "@/lib/images";

/* eslint-disable @next/next/no-img-element */
import { useApi } from "@/lib/hooks";
import { SITE, bdt, bdtText, fmtDate } from "@/lib/config";
import type { OrderDetailData } from "@/lib/types";

export default function Invoice({ id }: { id: string }) {
  const { data: o, error, loading } = useApi<OrderDetailData>(`/api/admin/orders/${id}`);
  if (loading) return <p className="px-5 py-10 text-muted">Loading...</p>;
  if (error || !o) return <p role="alert" className="px-5 py-10 text-terracotta">{error ?? "Order not found."}</p>;

  return (
    <div className="bg-[#E6E4DF] px-4 py-10 print:bg-white print:p-0">
      <article className="mx-auto max-w-[44rem] bg-white p-8 shadow-lg sm:p-12 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-forest/60 pb-6">
          <div className="flex items-center gap-4">
            <img src={IMG.logo} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="font-serif text-3xl font-semibold text-forest">{SITE.name}</p>
              <p className="text-sm text-muted">{SITE.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Invoice</p>
            <p className="mt-1 font-serif text-2xl text-forest">{o.invoiceNo}</p>
            <p className="text-sm text-muted">{fmtDate(o.createdAt)}</p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 border-b border-line pb-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Bill to</p>
            <p className="mt-2 font-semibold text-forest">{o.customerName}</p>
            <p className="text-sm text-muted">{o.phone}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted">{o.address}{"\n"}{o.district}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Payment</p>
            <p className="mt-2 inline-block rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-forest">{o.paymentMethod === "COD" ? "Cash on Delivery" : o.paymentMethod}</p>
            <p className="mt-2 text-sm text-muted">Order status: {o.status}</p>
          </div>
        </section>

        <table className="mt-8 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr><th className="pb-3 font-medium">Item</th><th className="pb-3 text-center font-medium">Qty</th><th className="pb-3 text-right font-medium">Amount</th></tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.id} className="border-t border-line">
                <td className="py-4"><p className="font-semibold text-forest">{it.productName}</p><p className="text-muted">{bdt(it.unitPrice)} each</p></td>
                <td className="py-4 text-center">{it.quantity}</td>
                <td className="py-4 text-right">{bdtText(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-6 flex max-w-xs items-baseline justify-between border-t-2 border-forest/60 pt-4">
          <span className="font-serif text-xl font-semibold text-forest">Total</span>
          <span className="font-serif text-2xl font-semibold text-forest">{bdtText(o.total)}</span>
        </div>
        <p className="mt-12 text-center text-xs text-muted">Thank you for choosing {SITE.name}. {SITE.email}</p>
      </article>

      <button type="button" onClick={() => window.print()} className="btn-dark fixed bottom-6 right-6 !rounded-full shadow-xl print:hidden">Print invoice</button>
    </div>
  );
}
