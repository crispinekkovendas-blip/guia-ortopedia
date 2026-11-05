import { buildIndex, search } from "./smart-search.ts";
import type { SearchIndex } from "./smart-search.ts";
import { orthoChunks, orthoTerms } from "./ortho-guide/chunks.ts";
import type { GuideChunk } from "./ortho-guide/chunks.ts";
import { COLA } from "./ortho-guide/cola.ts";

/*
 * Os trechos que a Super Inteligência lê: o Guia de ortopedia (3 trechos por
 * tópico + 1 por procedimento) e a cola do plantão (1 por texto). A busca é
 * por palavra (erro de digitação, sinônimo), com os mesmos pesos da busca do
 * site; sem embeddings — o guia é pequeno o bastante.
 */

export type { GuideChunk } from "./ortho-guide/chunks.ts";
export type ChunkSource = "ortopedia";

export const SOURCE_LABEL: Readonly<Record<ChunkSource, string>> = {
  ortopedia: "Guia de ortopedia — plantão e ambulatório",
};

/** A cola do plantão como trechos: a IA pode citar o texto pronto da queixa. */
function colaChunks(): GuideChunk[] {
  return COLA.map((c) => ({
    id: `cola-${c.id}#0`,
    slug: c.id,
    topic: `Cola do plantão: ${c.title}`,
    chapter: "Cola do plantão (textos prontos do prontuário e da receita)",
    section: c.cid ? `CID ${c.cid}` : null,
    source: "ortopedia" as const,
    href: `/cola#${c.id}`,
    text: `${c.hint ? `${c.hint}\n` : ""}${c.text}`,
  }));
}

export function guideChunks(): GuideChunk[] {
  return [...orthoChunks(), ...colaChunks()];
}

let cache: { chunks: GuideChunk[]; byId: Map<string, GuideChunk>; index: SearchIndex } | null = null;

function corpus() {
  if (!cache) {
    const chunks = guideChunks();
    cache = {
      chunks,
      byId: new Map(chunks.map((c) => [c.id, c])),
      index: buildIndex(
        chunks.map((c) => {
          // Como o paciente fala, as manobras e os remédios (mesmos pesos da busca do site); a cola só pelo texto.
          const orto = c.id.startsWith("orto-") ? orthoTerms(c.slug) : null;
          return {
            id: c.id,
            fields: [
              { text: c.topic, weight: 10 },
              { text: orto?.names.join(" ") ?? "", weight: 8 },
              { text: orto ? [...orto.exams, ...orto.drugs].join(" ") : "", weight: 5 },
              { text: c.section ?? "", weight: 4 },
              { text: c.chapter, weight: 2 },
              { text: c.text, weight: 1 },
            ],
          };
        })
      ),
    };
  }
  return cache;
}

export function chunkById(id: string): GuideChunk | undefined {
  return corpus().byId.get(id);
}

/** Os trechos mais relevantes para uma consulta. */
export function retrieveChunks(query: string, limit = 6): GuideChunk[] {
  const { index, byId } = corpus();
  return search(index, query, { limit, match: "any" })
    .hits.map((h) => byId.get(h.id))
    .filter((c): c is GuideChunk => Boolean(c))
    .slice(0, limit);
}

/** Como o trecho chega à IA: identificador, fonte, de onde é, e o texto. */
export function formatChunk(c: GuideChunk): string {
  return `<trecho id="${c.id}" fonte="${SOURCE_LABEL[c.source as ChunkSource] ?? c.source}">\nTópico: ${c.topic} (${c.chapter})${c.section ? ` › ${c.section}` : ""}\n${c.text}\n</trecho>`;
}
