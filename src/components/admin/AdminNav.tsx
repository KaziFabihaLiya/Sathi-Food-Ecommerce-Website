"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminNav() {
  const path = usePathname();
  if (path.startsWith("/admin/login")) return null;
  return (
    <header className="border-b border-line bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link href="/admin" className="font-serif text-xl font-semibold text-forest">Shathi Foods Admin</Link>
        <nav aria-label="Admin" className="flex items-center gap-5 text-sm font-medium text-ink/75">
          {links.map((l) => {
            const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                className={active ? "text-forest underline underline-offset-8 decoration-gold decoration-2" : "hover:text-forest"}>
                {l.label}
              </Link>
            );
          })}
          <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="text-terracotta hover:underline">Sign out</button>
        </nav>
      </div>
    </header>
  );
}
