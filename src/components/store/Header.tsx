/* eslint-disable @next/next/no-img-element */
import { IMG } from "@/lib/images";
import Link from "next/link";

const links = [
  { href: "/#collection", label: "Shop ghee" },
  { href: "/#photos", label: "Real photos" },
  { href: "/#reviews", label: "Reviews" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 bg-white p-0.5">
            <img src={IMG.logo} alt="" className="h-full w-full rounded-full object-cover" />
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-xl font-semibold text-forest">Shathi Foods</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Pure &amp; Traditional</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 text-[15px] font-medium text-ink/65 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-forest">{l.label}</Link>
          ))}
        </nav>
        <Link href="/#order" className="btn-primary !px-5 !py-2.5">Order now</Link>
      </div>
    </header>
  );
}
