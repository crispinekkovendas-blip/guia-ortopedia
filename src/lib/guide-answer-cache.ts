import { createHash } from "node:crypto";
import { stem, tokens } from "./smart-search.ts";
import { guideChunks } from "./guide-chunks.ts";

/*
 * Memória das respostas da Super Inteligência: a mesma pergunta, feita de
 * novo, volta na hora e sem custo. "Mesma pergunta" é decidida pelas
 * palavras que importam (radical, sem ordem, sem "qual", "pra") e pelos
 * números ("20 kg"); a chave leva a versão do guia, então texto novo
 * invalida as respostas antigas. Este produto não tem banco: a memória vive
 * na instância (some num reinício, não é compartilhada) — serve ao plantão.
 */

const FILLER = new Set(
  "pra pro pras pros numa num numas nuns posso pode podemos usar uso serve servem fazer faco depois proximo passo agora entao ai favor sobre preciso queria gostaria saber me eu voce devo deve seria".split(" ")
);

export function questionNumbers(question: string): string[] {
  return [...new Set((question.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")))].sort();
}

export function questionKey(question: string): string | null {
  const words = [...new Set(tokens(question).filter((t) => !/\d/.test(t) && !FILLER.has(t)).map((t) => stem(t)))].sort();
  if (words.length < 2) return null;
  return `${words.join(" ")}|${questionNumbers(question).join(" ")}`;
}

/** Subir quando o SYSTEM do guide-ask mudar o formato da resposta. */
const PROMPT_REVISION = 1;
let version: string | null = null;

export function guideVersion(): string {
  if (!version) {
    const chunks = guideChunks().map((c) => `${c.id}:${c.text}`).join("\n");
    version = createHash("sha256").update(`prompt:${PROMPT_REVISION}\n${chunks}`).digest("hex").slice(0, 16);
  }
  return version;
}

export interface CachedAnswer {
  answer: string;
  sources: { id: string; slug: string; topic: string; section: string | null; source?: "ortopedia"; href?: string }[];
  createdAt: string;
}

export interface AnswerStore {
  get(key: string, guide: string): Promise<CachedAnswer | null>;
  save(key: string, guide: string, question: string, entry: Omit<CachedAnswer, "createdAt">): Promise<void>;
}

/** Memória na instância (até 500 respostas). */
export function memoryStore(): AnswerStore {
  const memory = new Map<string, CachedAnswer>();
  return {
    async get(key, guide) {
      return memory.get(`${guide}|${key}`) ?? null;
    },
    async save(key, guide, _question, entry) {
      if (memory.size > 500) memory.delete(memory.keys().next().value!);
      memory.set(`${guide}|${key}`, { ...entry, createdAt: new Date().toISOString().slice(0, 16).replace("T", " ") });
    },
  };
}
