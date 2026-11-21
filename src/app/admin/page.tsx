"use client";
import Link from "next/link";
import { useApi } from "@/lib/hooks";
import { bdtText } from "@/lib/config";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const { data, error, loading } = useApi<DashboardData>("/api/admin/dashboard");
  const stats = data && [
    { label: "Orders today", value: String(data.ordersToday) },
    { label: "Pending orders", value: String(data.pendingOrders) },
    { label: "Revenue this month", value: bdtText(data.revenueThisMonth) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-serif text-4xl font-semibold text-forest">Dashboard</h1>
      {error && <p role="alert" className="mt-6 text-terracotta">{error}</p>}
      {loading && <p className="mt-6 text-muted">Loading...</p>}
      {data && stats && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-3 font-serif text-2xl font-semibold text-forest">{s.value}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <h2 className="p-6 font-serif text-xl font-semibold text-forest">Recent orders</h2>
            {data.recentOrders.length === 0 ? (
              <p className="px-6 pb-8 text-muted">No orders yet. New orders will appear here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-cream text-muted">
                    <tr>{["Invoice", "Customer", "Items", "Total", "Status"].map((h) => <th key={h} scope="col" className="px-6 py-4 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id} className="border-t border-line">
                        <td className="px-6 py-4"><Link href={`/admin/orders/${o.id}`} className="font-medium text-forest underline underline-offset-4">{o.invoiceNo}</Link></td>
                        <td className="px-6 py-4"><p className="font-medium text-ink">{o.customerName}</p><p className="text-muted">{o.phone}</p></td>
                        <td className="px-6 py-4">{o.itemsSummary}</td>
                        <td className="px-6 py-4">{bdtText(o.total)}</td>
                        <td className="px-6 py-4">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
