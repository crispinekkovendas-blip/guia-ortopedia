import { Fragment } from "react";
import type { ConciseLine } from "@/lib/revision-diff";

/** Uma linha do "o que mudou": o que saiu riscado em vermelho, o que entrou em verde, "→" entre os dois. */
export function ConciseText({ line, className = "" }: { line: ConciseLine; className?: string }) {
  return (
    <p className={`min-w-0 leading-snug break-words ${className}`}>
      {line.label ? <b className="mr-1 font-bold text-pine-950">{line.label}:</b> : null}
      {line.parts.map((p, i) => {
        const prev = line.parts[i - 1];
        const arrow = p.k === "ins" && prev?.k === "del";
        return (
          <Fragment key={i}>
            {arrow ? (
              <span aria-label="mudou para" className="mx-1 text-pine-900/45">
                →
              </span>
            ) : i > 0 && p.sp ? (
              " "
            ) : null}
            {p.k === "del" ? (
              <del className="text-rose-800 decoration-rose-400/80">{p.t}</del>
            ) : p.k === "ins" ? (
              <ins className="rounded bg-emerald-50 px-0.5 font-semibold text-emerald-900 no-underline">{p.t}</ins>
            ) : (
              <span className="text-pine-900/55">{p.t}</span>
            )}
          </Fragment>
        );
      })}
    </p>
  );
}

/** As linhas de uma mudança, com marcador. */
export function ConciseLines({ lines }: { lines: readonly ConciseLine[] }) {
  return (
    <ul className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-pine-300" />
          <ConciseText line={line} />
        </li>
      ))}
    </ul>
  );
}
