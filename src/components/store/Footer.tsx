/* eslint-disable @next/next/no-img-element */
import { IMG } from "@/lib/images";
import { SITE } from "@/lib/config";

export default function Footer() {
  const links = [
    { label: SITE.email, href: `mailto:${SITE.email}` },
    { label: "Facebook", href: SITE.facebook },
    { label: "Instagram", href: SITE.instagram },
    { label: "WhatsApp", href: `https://wa.me/${SITE.whatsappNumber}` },
  ];
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-9 md:flex-row md:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-cream p-0.5">
            <img src={IMG.logo} alt="" className="h-full w-full rounded-full object-cover" />
          </span>
          <div className="leading-tight">
            <p className="font-serif text-lg font-semibold">{SITE.name}</p>
            <p className="text-sm text-cream/65">{SITE.tagline}</p>
          </div>
        </div>
        <nav aria-label="Contact" className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-cream/75">
          {links.map((l) => (
            <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="transition hover:text-cream">
              {l.label}
            </a>
          ))}
        </nav>
        <p className="text-sm text-cream/65">© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
