import Link from "next/link";
import { ORTHO_GUIDE } from "@/lib/ortho-guide";
import { REF_IMAGES, imageStats } from "@/lib/images";
import { TopicImages } from "@/components/guide/topic-images";

export const metadata = { title: "Imagens" };

/** Todas as imagens de referência, por tópico e procedimento, com os créditos. */
export default function ImagensPage() {
  const stats = imageStats();
  const topics = ORTHO_GUIDE.flatMap((c) => c.topics.map((t) => ({ chapter: c.title, topic: t, groups: REF_IMAGES.filter((p) => p.slug === t.slug && p.images.length > 0) }))).filter(
    (x) => x.groups.length > 0
  );
  const licenses = Object.entries(stats.licenses).sort((a, b) => b[1] - a[1]);
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-pine-950 sm:text-[28px]">Imagens de referência</h1>
        <p className="mt-1 max-w-3xl text-sm text-pine-900/60">
          {stats.images} imagens de {stats.procedures} procedimentos — fotos, radiografias e esquemas publicados com licença livre (Wikimedia Commons e artigos em
          acesso aberto), cada uma com autor, licença e a página de origem. Mostram como a lesão se apresenta, o resultado esperado da redução ou da imobilização e
          o material; a técnica em si está nas ilustrações animadas de cada procedimento, no tópico.
        </p>
        <p className="mt-2 flex flex-wrap gap-1.5 text-[11.5px]">
          {licenses.map(([l, n]) => (
            <span key={l} className="chip bg-pine-50 text-pine-800">
              {l} · {n}
            </span>
          ))}
        </p>
      </header>
      <nav aria-label="Tópicos" className="mb-5 flex flex-wrap gap-1.5">
        {topics.map(({ topic }) => (
          <a key={topic.slug} href={`#${topic.slug}`} className="rounded-full border border-pine-900/12 bg-white px-3 py-1.5 text-[12px] font-bold text-pine-900/70 hover:border-pine-400">
            {topic.title}
          </a>
        ))}
      </nav>
      <div className="space-y-8">
        {topics.map(({ chapter, topic, groups }) => (
          <section key={topic.slug} id={topic.slug} className="card scroll-mt-20 p-4 sm:p-6">
            <p className="text-[11px] font-bold text-pine-900/45">{chapter}</p>
            <h2 className="text-lg font-extrabold text-pine-950">
              <Link href={`/guia/${topic.slug}`} className="hover:underline">
                {topic.title}
              </Link>
            </h2>
            <div className="mt-3">
              <TopicImages groups={groups} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
