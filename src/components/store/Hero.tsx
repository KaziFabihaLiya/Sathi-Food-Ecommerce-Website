/* eslint-disable @next/next/no-img-element */
import { IMG } from "@/lib/images";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-[#F3DFA8]/50 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p className="inline-block rounded-full border border-line bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Traditionally made · Naturally better
          </p>
          <h1 className="mt-7 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-forest sm:text-6xl lg:text-[4.5rem]">
            The comfort of <span className="text-terracotta">real ghee</span>, in every spoonful.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/65">
            Made with care from quality cow&apos;s milk and cream, Shathi Foods brings a wholesome, familiar taste to your kitchen.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/#collection" className="btn-primary">Shop our ghee</Link>
            <Link href="/#order" className="btn-light">Order on this page</Link>
          </div>
        </div>
        <div className="relative">
          <div className="rotate-[2deg] rounded-[2.5rem] bg-[#EBDDB2] p-5 sm:p-7">
            <div className="-rotate-[2deg] overflow-hidden rounded-3xl border-[6px] border-white bg-white shadow-xl">
              <img src={IMG.hero} alt="A jar of Shathi Foods Gold Ghee beside a plate of rice on a wooden table" className="aspect-[3/2] w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
