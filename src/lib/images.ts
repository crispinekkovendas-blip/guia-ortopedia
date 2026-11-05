import data from "./images.json" with { type: "json" };

/*
 * As imagens de referência dos procedimentos: fotos, radiografias e esquemas
 * com licença livre (Wikimedia Commons e artigos em acesso aberto), uma a uma
 * com autor, licença e a página de origem. `scripts/images/build.mjs` gera
 * `public/imagens/<slug>/…` e `src/lib/images.json` a partir da pasta de
 * referências curadas; aqui só se lê.
 */

export interface RefImage {
  /** Nome do arquivo em public/imagens/<slug>/ (e no aparelho, no app). */
  file: string;
  /** Caminho no site: "/imagens/<slug>/<file>". */
  src: string;
  title: string;
  author: string;
  license: string;
  /** A página de origem (Commons, PMC…). */
  page: string;
  w: number;
  h: number;
}

export interface ProcedureImages {
  /** Slug do tópico. */
  slug: string;
  /** O procedimento (número no guia, 1…37) e a sua posição no tópico (k, 1…). */
  n: number;
  k: number;
  name: string;
  images: RefImage[];
}

export const REF_IMAGES: ProcedureImages[] = data as ProcedureImages[];

/** As imagens de um tópico, por procedimento. */
export function topicImages(slug: string): ProcedureImages[] {
  return REF_IMAGES.filter((p) => p.slug === slug && p.images.length > 0);
}

export function imageStats(): { procedures: number; images: number; licenses: Record<string, number> } {
  const licenses: Record<string, number> = {};
  let images = 0;
  for (const p of REF_IMAGES) for (const i of p.images) { images++; licenses[i.license] = (licenses[i.license] ?? 0) + 1; }
  return { procedures: REF_IMAGES.filter((p) => p.images.length > 0).length, images, licenses };
}
