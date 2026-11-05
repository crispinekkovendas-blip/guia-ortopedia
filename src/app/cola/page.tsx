import Link from "next/link";
import { COLA, COLA_GROUPS, colaByGroup } from "@/lib/ortho-guide/cola";
import { findOrthoTopic } from "@/lib/ortho-guide";
import { ColaCard } from "@/components/guide/cola-card";

export const metadata = { title: "Cola do plantão" };

/** A cola do plantão: os textos prontos do prontuário, da receita e da medicação, para copiar com um toque. */
export default function ColaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-pine-950 sm:text-[28px]">Cola do plantão</h1>
        <p className="mt-1 max-w-2xl text-sm text-pine-900/60">
          {COLA.length} textos prontos, como vão no prontuário: história, exame e conduta por queixa; a receita para casa; a medicação na unidade; as notas de
          luxação, sutura, trauma e fratura exposta; as incidências do raio-X. Os do caderno do médico vêm como ele escreve; os marcados <span className="chip bg-clay-50 text-clay-800">do guia</span>{" "}
          foram acrescentados no mesmo jeito para as queixas que faltavam, com as doses do guia. Abra, confira o que é do paciente (lado, CID, dose por peso) e copie.
        </p>
      </header>
      <nav aria-label="Grupos" className="scroll-x -mx-1 mb-5 flex gap-1.5 px-1">
        {COLA_GROUPS.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="shrink-0 rounded-full border border-pine-900/12 bg-white px-3 py-1.5 text-[12px] font-bold text-pine-900/70 hover:border-pine-400">
            {g.label} <span className="text-pine-900/40">{colaByGroup(g.id).length}</span>
          </a>
        ))}
      </nav>
      <div className="space-y-7">
        {COLA_GROUPS.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-20">
            <h2 className="text-[11.5px] font-extrabold tracking-[0.12em] text-pine-900/55 uppercase">{g.label}</h2>
            <p className="mb-2 text-[12.5px] text-pine-900/55">{g.hint}</p>
            <div className="space-y-2">
              {colaByGroup(g.id).map((c) => (
                <div key={c.id}>
                  <ColaCard entry={c} />
                  {c.topic && findOrthoTopic(c.topic) ? (
                    <p className="mt-0.5 px-3.5 text-[11.5px] text-pine-900/50">
                      No guia:{" "}
                      <Link href={`/guia/${c.topic}`} className="font-bold text-pine-600 hover:underline">
                        {findOrthoTopic(c.topic)?.topic.title}
                      </Link>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-8 text-[12px] text-pine-900/50">
        Caderno do próprio médico (plantão de ortopedia, 2026). Doses e esquemas são os que ele usa; confira alergias, gestação, função renal e o peso da
        criança antes de copiar.
      </p>
    </div>
  );
}
