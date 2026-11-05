"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { href: "/guia", label: "Guia" },
  { href: "/guia/consulta", label: "Atender agora" },
  { href: "/cola", label: "Cola" },
  { href: "/imagens", label: "Imagens" },
  { href: "/guia/revisoes", label: "Revisões" },
  { href: "/app", label: "App Android" },
  { href: "/pdf/Guia-de-ortopedia.pdf", label: "PDF" },
];

/** O alto de toda página: o nome do guia, as cinco entradas e o tema. */
export function SiteNav() {
  const path = usePathname();
  const active = (href: string) => (href === "/guia" ? path === "/guia" || (path.startsWith("/guia/") && !LINKS.some((l) => l.href !== "/guia" && path.startsWith(l.href))) : path.startsWith(href));
  return (
    <header className="sticky top-0 z-20 border-b border-pine-900/10 bg-paper/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6 md:px-8">
        <Link href="/guia" className="shrink-0 text-[15px] font-extrabold tracking-tight text-pine-950">
          🦴 Guia de Ortopedia
        </Link>
        <nav aria-label="Seções" className="scroll-x -mx-1 flex min-w-0 flex-1 gap-1 px-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold ${active(l.href) ? "bg-pine-950 text-white" : "text-pine-900/70 hover:bg-pine-100"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle compact className="shrink-0" />
      </div>
    </header>
  );
}
