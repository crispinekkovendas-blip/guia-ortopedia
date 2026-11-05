import { createHash } from "node:crypto";
import type { SearchDoc } from "./smart-search.ts";
import type { ConciseLine } from "./revision-diff.ts";
import { SYNONYM_TABLE } from "./search-synonyms.ts";
import { FIRST_DAY, ORTHO_CREDIT, ORTHO_GUIDE, SPRITES_VERSION, orthoDocs, orthoSearchDoc, procedureImage } from "./ortho-guide/index.ts";
import type { OrthoProcedure, OrthoTopic } from "./ortho-guide/index.ts";
import { ORTHO_REGIONS, TRAUMA_TOPICS, UNIVERSAL_ALARM } from "./ortho-guide/consult.ts";
import type { OrthoRegion } from "./ortho-guide/consult.ts";
import { CURRENT_ORTHO_REVISION, ORTHO_CHANGES, ORTHO_REVISIONS, orthoTopicRevised } from "./ortho-guide/revisions.ts";
import { conciseDiff } from "./revision-diff.ts";
import { REF_IMAGES } from "./images.ts";
import type { RefImage } from "./images.ts";

/*
 * O guia inteiro para o app Android, num arquivo só. O formato é o do pacote
 * do Guia Renova (o app é o mesmo código): as abas Receitas, Plantão e Drive
 * vêm vazias — este app só tem a ortopedia. O app guarda o arquivo e funciona
 * sem internet; a versão (hash do conteúdo) diz se precisa baixar de novo.
 */

export interface AppSearchItem {
  id: string;
  source: "ortopedia";
  title: string;
  where: string;
  cid: string | null;
  lines: string[];
}

/** Um tópico como vai ao app: o do site, com id, capítulo, quantas mudanças o tocam, as ilustrações e as imagens de referência. */
export interface AppOrthoTopic extends OrthoTopic {
  id: string;
  chapter: string;
  revised: number;
  procedures?: (OrthoProcedure & { image: string })[];
  /** As imagens de referência (caminho no site; o app baixa e guarda). */
  images?: (RefImage & { procedure: string })[];
}

export interface AppOrthoChange {
  rev: number;
  slug: string;
  title: string;
  section: string;
  before: string;
  after: string;
  why: string;
  alsoIn: string[];
  concise: ConciseLine[];
}

export interface AppOrtho {
  credit: { title: string; revision: number; writtenAt: string; revisedAt: string; reviewedBy: string | null };
  revision: { current: number; list: { n: number; date: string; label: string }[] };
  firstDay: { slug: string; label: string; hint: string }[];
  regions: OrthoRegion[];
  universalAlarm: string[];
  traumaTopics: string[];
  chapters: { title: string; intro: string; topics: AppOrthoTopic[] }[];
  /** Versão das ilustrações e imagens: o app apaga a cópia local e baixa de novo quando muda. */
  spritesVersion: number;
  changes: AppOrthoChange[];
  search: { docs: SearchDoc[]; items: AppSearchItem[] };
}

export interface AppBundle {
  version: string;
  revision: { current: number; list: { n: number; date: string; label: string }[] };
  receitas: { groups: string[]; items: never[] };
  plantao: { credit: { title: string; edition: string; publisher: string; authors: string[]; reviewedAt: string }; chapters: never[] };
  drive: { credit: { basedOn: string; original: string; reviewedAt: string }; sections: never[] };
  search: { synonyms: Record<string, readonly string[]>; docs: SearchDoc[]; items: AppSearchItem[] };
  conditions: never[];
  changes: never[];
  ortopedia: AppOrtho;
}

/** A versão das imagens entra na das ilustrações: mudou a lista, o app baixa de novo. */
function mediaVersion(): number {
  const h = createHash("sha256").update(JSON.stringify(REF_IMAGES.map((p) => [p.slug, p.k, p.images.map((i) => i.src)]))).digest("hex");
  return SPRITES_VERSION * 1000 + (parseInt(h.slice(0, 6), 16) % 1000);
}

function buildOrtho(): AppOrtho {
  const title = new Map(ORTHO_GUIDE.flatMap((c) => c.topics.map((t) => [t.slug, t.title] as const)));
  const docs = orthoDocs();
  const items: AppSearchItem[] = docs.map((d) => ({
    id: `ortopedia:${d.slug}`,
    source: "ortopedia" as const,
    title: d.title,
    where: d.chapter,
    cid: d.cid === "—" ? null : d.cid,
    lines: [d.summary, ...d.aliases.map((a) => `Também chamado: ${a}`), ...d.exams.map((e) => `Manobra: ${e}`), ...d.drugs],
  }));
  return {
    credit: { ...ORTHO_CREDIT },
    revision: { current: CURRENT_ORTHO_REVISION, list: ORTHO_REVISIONS.map((r) => ({ n: r.n, date: r.date, label: r.label })) },
    firstDay: FIRST_DAY.map((s) => ({ ...s })),
    regions: ORTHO_REGIONS.map((r) => ({ ...r, topics: [...r.topics], alarm: [...r.alarm] })),
    universalAlarm: [...UNIVERSAL_ALARM],
    traumaTopics: [...TRAUMA_TOPICS],
    chapters: ORTHO_GUIDE.map((c) => ({
      title: c.title,
      intro: c.intro,
      topics: c.topics.map((t): AppOrthoTopic => {
        const images = REF_IMAGES.filter((p) => p.slug === t.slug).flatMap((p) => p.images.map((i) => ({ ...i, procedure: p.name })));
        return {
          ...t,
          id: `ortopedia:${t.slug}`,
          chapter: c.title,
          revised: orthoTopicRevised(t.slug),
          procedures: t.procedures?.map((p, k) => ({ ...p, image: procedureImage(t.slug, k + 1).svg })),
          ...(images.length ? { images } : {}),
        };
      }),
    })),
    spritesVersion: mediaVersion(),
    changes: ORTHO_CHANGES.map((c) => ({
      rev: c.rev,
      slug: c.slug,
      title: title.get(c.slug) ?? c.slug,
      section: c.section,
      before: c.before,
      after: c.after,
      why: c.why,
      alsoIn: [...(c.alsoIn ?? [])],
      concise: [{ parts: conciseDiff(c.before, c.after) }],
    })),
    search: { docs: docs.map((d) => ({ ...orthoSearchDoc(d), id: `ortopedia:${d.slug}` })), items },
  };
}

function buildBundle(): Omit<AppBundle, "version"> {
  const ortopedia = buildOrtho();
  return {
    revision: ortopedia.revision,
    receitas: { groups: [], items: [] },
    plantao: { credit: { title: ORTHO_CREDIT.title, edition: `revisão ${ORTHO_CREDIT.revision}`, publisher: "Guia de Ortopedia", authors: [], reviewedAt: ORTHO_CREDIT.revisedAt }, chapters: [] },
    drive: { credit: { basedOn: "", original: "", reviewedAt: ORTHO_CREDIT.revisedAt }, sections: [] },
    search: { synonyms: SYNONYM_TABLE, docs: ortopedia.search.docs, items: ortopedia.search.items },
    conditions: [],
    changes: [],
    ortopedia,
  };
}

let cached: { bundle: AppBundle; json: string } | null = null;

/** O pacote (montado uma vez por instância: o guia vem do código, só muda com um deploy). */
export function appBundle(): { bundle: AppBundle; json: string } {
  if (!cached) {
    const body = buildBundle();
    const version = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 16);
    const bundle: AppBundle = { version, ...body };
    cached = { bundle, json: JSON.stringify(bundle) };
  }
  return cached;
}
