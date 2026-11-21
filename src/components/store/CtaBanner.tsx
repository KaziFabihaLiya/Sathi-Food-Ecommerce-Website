import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="bg-terracotta px-5 py-16 text-center md:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F2C56B]">Ready when you are</p>
      <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold text-cream md:text-5xl">Bring home a jar of honest goodness.</h2>
      <Link href="/#order" className="mt-8 inline-flex rounded-full bg-cream px-8 py-3.5 font-semibold text-terracotta shadow-lg transition hover:brightness-95">
        Place your order
      </Link>
    </section>
  );
}
