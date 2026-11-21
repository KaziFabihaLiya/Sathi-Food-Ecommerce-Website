import OrderForm from "./OrderForm";
import { SITE } from "@/lib/config";

export default function OrderSection() {
  return (
    <section id="order" className="bg-cream py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="eyebrow">Simple cash-on-delivery order</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-forest md:text-5xl">Order in under a minute.</h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink/60">
            No account and no advance payment. Enter your delivery details, then pay only after the order arrives.
          </p>
          <div className="mt-8 max-w-md rounded-2xl bg-forest p-6">
            <p className="font-serif text-xl text-cream">Need help placing an order?</p>
            <a href={`https://wa.me/${SITE.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-gold hover:underline">
              WhatsApp {SITE.whatsappDisplay}
            </a>
          </div>
        </div>
        <OrderForm />
      </div>
    </section>
  );
}
