import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://guia-ortopedia.vercel.app"),
  title: { default: "Guia de Ortopedia", template: "%s · Guia de Ortopedia" },
  description:
    "O guia para o médico que é o ortopedista de plantão e de ambulatório no SUS: 54 tópicos na ordem da consulta, 37 procedimentos ilustrados e animados, imagens de referência, consulta guiada com nota SOAP e app Android que funciona sem internet.",
};

export const viewport: Viewport = {
  themeColor: "#121a26",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="theme-app min-h-dvh">
        <SiteNav />
        <main className="mx-auto min-w-0 max-w-6xl px-4 pt-4 pb-16 sm:px-6 md:px-8 md:py-6 print:p-0">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-pine-900/50 sm:px-6 md:px-8">
          Guia de Ortopedia · texto próprio escrito a partir das diretrizes citadas em cada tópico; ainda sem revisão por ortopedista — confira doses, técnicas e condutas com o
          protocolo do serviço. Imagens de referência com licença livre, creditadas uma a uma.
        </footer>
      </body>
    </html>
  );
}
