"use client";

import { useState } from "react";
import type { ColaEntry } from "@/lib/ortho-guide/cola";

/** Um texto da cola: título, CID, o texto como vai no prontuário e o botão que copia tudo. */
export function ColaCard({ entry, open = false }: { entry: ColaEntry; open?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(entry.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sem área de transferência (http antigo): o texto está na tela para selecionar.
    }
  }
  return (
    <details id={entry.id} open={open} className="group scroll-mt-20 rounded-2xl border border-pine-900/10 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold text-pine-950">{entry.title}</span>
          {entry.hint ? <span className="block text-[12px] text-pine-900/55">{entry.hint}</span> : null}
        </span>
        {entry.cid ? <span className="chip shrink-0 bg-pine-50 text-pine-800 tabular-nums">CID {entry.cid}</span> : null}
        <span aria-hidden className="shrink-0 text-pine-900/40 transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="border-t border-pine-900/10 px-3.5 py-3">
        <pre className="font-sans text-[13px] leading-snug whitespace-pre-wrap text-pine-900/85">{entry.text}</pre>
        <button
          type="button"
          onClick={copy}
          className={`mt-3 inline-flex min-h-10 items-center rounded-full px-4 text-[13px] font-bold ${copied ? "bg-emerald-600 text-white" : "bg-pine-950 text-white hover:bg-pine-900"}`}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
    </details>
  );
}
