import Link from "next/link";
import { notFound } from "next/navigation";
import { findOrthoTopic, orthoSlugs } from "@/lib/ortho-guide";
import { CURRENT_ORTHO_REVISION, orthoRevisionLabel, orthoTopicRevised } from "@/lib/ortho-guide/revisions";
import { topicImages } from "@/lib/images";
import { colaForTopic } from "@/lib/ortho-guide/cola";
import { ColaCard } from "@/components/guide/cola-card";
import { ORTHO_SECTIONS, OrthoTopicBody } from "@/components/guide/ortho-topic";
import { OrthoCredit } from "@/components/guide/ortho-credit";
import { TopicImages } from "@/components/guide/topic-images";

export function generateStaticParams() {
  return orthoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const found = findOrthoTopic((await params).slug);
  return { title: found ? found.topic.title : "Guia" };
}

/** Um tópico do guia, com o sumário das seções, as imagens de referência e os outros do capítulo ao lado. */
export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const found = findOrthoTopic((await params).slug);
  if (!found) notFound();
  const { chapter, topic, prev, next } = found;
  const revised = orthoTopicRevised(topic.slug);
  const images = topicImages(topic.slug);
  const cola = colaForTopic(topic.slug);
  const present = new Set<string>([
    "perguntar",
    ...(topic.exam.length ? ["examinar"] : []),
    "alarme",
    ...(topic.imaging.length ? ["imagem"] : []),
    "urgencia",
    ...(topic.procedures?.length ? ["procedimentos"] : []),
    "conduta",
    ...(topic.rx.length ? ["receita"] : []),
    ...(topic.immobilize?.length ? ["imobilizar"] : []),
    "retorno",
    "cirurgia",
    "atestado",
  ]);
  const sections: (readonly [string, string])[] = [...ORTHO_SECTIONS.filter(([id]) => present.has(id)), ...(cola.length ? [["cola", "Cola do plantão"] as const] : []), ...(images.length ? [["imagens", "Imagens de referência"] as const] : [])];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <article className="min-w-0">
        <nav aria-label="Caminho" className="mb-2 text-xs font-semibold text-pine-900/50">
          <Link href="/guia" className="text-pine-600 hover:underline">
            Guia
          </Link>{" "}
          › {chapter.title}
        </nav>
        <h1 className="text-2xl leading-tight font-extrabold tracking-tight break-words text-pine-950 sm:text-[28px]">{topic.title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-pine-900/45">
          {topic.cid !== "—" ? <span className="chip bg-pine-50 text-pine-800 tabular-nums">CID {topic.cid}</span> : null}
          <span>Também: {topic.aliases.join(" · ")}</span>
        </p>

        {revised > 0 ? (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-950">
            <b>
              {revised} {revised === 1 ? "mudança" : "mudanças"} na {orthoRevisionLabel(CURRENT_ORTHO_REVISION)}
            </b>{" "}
            neste tópico ou numa receita de base que ele usa —{" "}
            <Link href="/guia/revisoes" className="font-bold underline">
              ver antes, agora e motivo
            </Link>
            .
          </p>
        ) : null}

        <nav aria-label="Seções" className="scroll-x mt-3 -mx-1 flex gap-1.5 px-1 pb-0.5 lg:hidden">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-pine-900/12 bg-white px-3 py-1.5 text-[12px] font-bold text-pine-900/70">
              {label}
            </a>
          ))}
        </nav>

        {topic.cid !== "—" ? (
          <Link
            href={`/guia/consulta?t=${topic.slug}`}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-pine-950 px-4 py-2 text-[13.5px] font-bold text-white hover:bg-pine-900 pointer-coarse:min-h-11"
          >
            🩺 Atender com este roteiro →
          </Link>
        ) : null}

        <div className="card mt-4 p-4 sm:p-6">
          <OrthoTopicBody topic={topic} />
          {cola.length ? (
            <section id="cola" className="mt-6 scroll-mt-20">
              <h2 className="mb-1 text-[11.5px] font-extrabold tracking-[0.12em] text-pine-900/55 uppercase">Cola do plantão</h2>
              <p className="mb-3 text-[12.5px] text-pine-900/55">
                O texto pronto do prontuário e da receita para esta queixa. Abra, confira o que é do paciente e copie.{" "}
                <Link href="/cola" className="font-bold text-pine-600 hover:underline">
                  Toda a cola →
                </Link>
              </p>
              <div className="space-y-2">
                {cola.map((c) => (
                  <ColaCard key={c.id} entry={c} />
                ))}
              </div>
            </section>
          ) : null}
          {images.length ? (
            <section id="imagens" className="mt-6 scroll-mt-20">
              <h2 className="mb-1 text-[11.5px] font-extrabold tracking-[0.12em] text-pine-900/55 uppercase">Imagens de referência</h2>
              <p className="mb-3 text-[12.5px] text-pine-900/55">
                Fotos, radiografias e esquemas com licença livre — como a lesão se apresenta, o resultado da imobilização, o material. Toque para abrir em tamanho cheio.
              </p>
              <TopicImages groups={images} />
            </section>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 [&>a]:min-w-0 [&>a]:break-words">
          {prev ? (
            <Link href={`/guia/${prev.slug}`} className="rounded-2xl border border-pine-900/10 bg-white px-3.5 py-2.5 text-sm hover:border-pine-400">
              <span className="block text-[11px] font-bold text-pine-900/45">← Anterior</span>
              <span className="font-bold text-pine-950">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/guia/${next.slug}`} className="rounded-2xl border border-pine-900/10 bg-white px-3.5 py-2.5 text-right text-sm hover:border-pine-400">
              <span className="block text-[11px] font-bold text-pine-900/45">Próximo →</span>
              <span className="font-bold text-pine-950">{next.title}</span>
            </Link>
          ) : null}
        </div>

        <div className="mt-6">
          <OrthoCredit compact />
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-16 space-y-5">
          <div>
            <p className="mb-2 text-xs font-extrabold tracking-[0.12em] text-pine-900/50 uppercase">Nesta página</p>
            <ul className="space-y-0.5">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="block rounded-lg px-2.5 py-1 text-[13px] leading-snug text-pine-900/70 hover:bg-pine-50">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-extrabold tracking-[0.12em] text-pine-900/50 uppercase">{chapter.title}</p>
            <ul className="space-y-0.5">
              {chapter.topics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/guia/${t.slug}`}
                    aria-current={t.slug === topic.slug ? "page" : undefined}
                    className={`block rounded-lg px-2.5 py-1.5 text-[13px] leading-snug ${
                      t.slug === topic.slug ? "bg-pine-100 font-bold text-pine-950" : "text-pine-900/70 hover:bg-pine-50"
                    }`}
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
