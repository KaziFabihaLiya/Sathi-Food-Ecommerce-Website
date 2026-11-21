import type { Metadata } from "next";
import OrderForm from "@/components/store/OrderForm";

export const metadata: Metadata = {
  title: "Place your order",
  description: "Order Shathi Foods ghee online with Cash on Delivery anywhere in Bangladesh.",
};

export default function OrderPage() {
  return (
    <section id="order" className="bg-cream py-14 md:py-20">
      <div className="mx-auto max-w-xl px-5">
        <p className="eyebrow">Simple cash-on-delivery order</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-forest md:text-5xl">Order in under a minute.</h1>
        <p className="mb-8 mt-4 text-ink/60">No account and no advance payment. Pay only after the order arrives.</p>
        <OrderForm />
      </div>
    </section>
  );
}
