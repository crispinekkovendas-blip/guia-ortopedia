import { chunkById, formatChunk, retrieveChunks } from "./guide-chunks.ts";
import type { ChunkSource, GuideChunk } from "./guide-chunks.ts";
import { geminiEnabled, streamGenerate } from "./gemini.ts";
import { citedIds } from "./guide-citations.ts";
import { guideVersion, memoryStore, questionKey } from "./guide-answer-cache.ts";
import type { AnswerStore } from "./guide-answer-cache.ts";

export { citedIds } from "./guide-citations.ts";
import type { GeminiChunk, GeminiContent, GeminiPart, GeminiRequest } from "./gemini.ts";

/*
 * "Perguntar ao guia": o médico pergunta em texto livre e o Gemini responde
 * só com o que está no Guia de ortopedia e na cola do plantão (RAG). A
 * pergunta já sai com os trechos mais relevantes; se faltar algo, o modelo
 * busca de novo com a ferramenta `buscar_no_guia`, até 3 vezes. Cada
 * afirmação cita o trecho ([[id]]); a tela transforma a citação em link.
 * O que o guia não traz, o modelo diz que não traz.
 */

const MAX_SEARCHES = 3;
export const MAX_QUESTION = 600;

export function guideAiEnabled(): boolean {
  return geminiEnabled();
}

export type AskEvent =
  | { t: "search"; q: string }
  | { t: "text"; d: string }
  | { t: "sources"; items: AskSource[] }
  | { t: "error"; m: string }
  | { t: "cached"; at: string }
  | { t: "done" };

export interface AskSource {
  id: string;
  slug: string;
  topic: string;
  section: string | null;
  source?: ChunkSource;
  href?: string;
}

export interface AskTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AskDeps {
  generate(req: GeminiRequest): AsyncGenerator<GeminiChunk>;
  retrieve(query: string, limit: number): Promise<GuideChunk[]>;
  store?: AnswerStore;
}

let sharedStore: AnswerStore | null = null;
const DEFAULT_DEPS: AskDeps = {
  generate: (req) => streamGenerate(req),
  retrieve: async (q, limit) => retrieveChunks(q, limit),
  get store() {
    sharedStore ??= memoryStore();
    return sharedStore;
  },
};

export const SYSTEM = `Você responde perguntas de médicos usando SOMENTE os trechos que aparecem nesta conversa — os anexados à pergunta e os que você buscar com a ferramenta buscar_no_guia. Os trechos vêm de duas partes do mesmo material:
- O Guia de ortopedia — plantão e ambulatório: para o médico que É o ortopedista de plantão e de ambulatório no SUS — o que perguntar, as manobras do exame e o que significam, sinais de alarme, pedido e leitura de imagem, o que fazer na urgência, os procedimentos (redução, tala, gesso, bloqueio, punção, infiltração) passo a passo, conduta, receita, imobilização, o seguimento no retorno, o que vai para a cirurgia ou o centro terciário pela regulação, e atestado.
- A cola do plantão (trechos cujo tópico começa com "Cola do plantão"): textos prontos para o prontuário, a receita, a medicação na unidade, as notas de urgência e a papelada do SUS, em caixa alta, como o médico cola no sistema.

Regras:
- Quem pergunta é o ortopedista do serviço: nunca responda "encaminhe ao ortopedista". Diga o que ele faz (reduz, imobiliza, punciona, infiltra, interna) com os passos do trecho, e o que sai da mão dele — cirurgia ou centro terciário pela regulação — com a urgência que o guia dá.
- Se o médico pedir um texto para o prontuário, a receita ou a regulação, use a cola: devolva o texto pronto inteiro, em caixa alta como está, trocando só o que ele informou (lado, CID, peso), e cite o trecho.
- Quando a pergunta vier com "Contexto" (a tela em que o médico está no app), responda para aquela situação: se ele está num tópico, priorize esse tópico; se está na consulta guiada, responda como quem está ao lado dele no consultório. Não repita o contexto na resposta.
- Doses do guia são para adulto sem comorbidade, salvo onde o trecho diz o contrário: lembre isso quando a pergunta envolver gestante, criança, idoso, alergia ou doença renal.
- Se os trechos não bastam, busque de novo com outros termos (nome do medicamento, da condição, sinônimo, nome da manobra). No máximo ${MAX_SEARCHES} buscas.
- Se o guia não traz a informação, diga isso claramente ("O guia não traz …") e pare. Nunca complete com conhecimento próprio: não invente dose, diluição, intervalo, via, duração nem indicação.
- Copie doses, apresentações, diluições e vias exatamente como no trecho.
- Se a pergunta traz peso ou idade, você pode calcular a partir da dose por kg do trecho, sempre escrevendo a conta inteira (dose por kg × peso = total por dia; total ÷ número de tomadas = dose por tomada). Se o trecho dá uma faixa, calcule as duas pontas. Confira cada multiplicação antes de escrever. Respeite e mostre a dose máxima do trecho.
- Cite a fonte logo após cada afirmação com [[id]], usando exatamente o id do trecho (ex.: [[orto-entorse-de-tornozelo#1]], [[cola-pront-lombalgia#0]]). Duas fontes: [[a#1]] [[b#2]], cada uma no seu par de colchetes.
- Quando a pergunta descreve queixas ou sintomas sem dizer qual é a condição, comece por **Hipóteses**: até 3 condições do guia que combinam, da mais para a menos provável, cada uma com o porquê, o que perguntar ou examinar para confirmar ou afastar e os sinais de alarme, se houver. Só depois a conduta do guia para a hipótese principal, com as fontes. Hipótese é apoio à decisão, não diagnóstico. Nesse caso, até ~300 palavras.
- Formato de plantão, em português do Brasil: comece pela resposta direta (dose/conduta), depois detalhes em tópicos curtos com "- ". Use **negrito** só para doses. Sem introdução, sem despedida. Até ~200 palavras, salvo se pedirem mais ou se for um texto da cola (esse vai inteiro).
- Não peça nem use dados que identifiquem o paciente.`;

const TOOL = {
  name: "buscar_no_guia",
  description:
    "Busca trechos no Guia de ortopedia e na cola do plantão, por palavra. Aceita condição, manobra, medicamento, sigla, sinônimo, sintoma ou uma frase. Devolve até 6 trechos com id, tópico e texto.",
  parameters: {
    type: "object",
    properties: { consulta: { type: "string", description: "O que buscar, ex.: 'redução luxação ombro rotação externa'" } },
    required: ["consulta"],
  },
};

function chunksBlock(chunks: readonly GuideChunk[]): string {
  return chunks.length ? chunks.map(formatChunk).join("\n\n") : "Nenhum trecho encontrado para essa busca.";
}

/** Só há um escopo neste produto; o tipo fica pela compatibilidade com o app e a tela. */
export type AskScope = "ortopedia";
export function parseScope(raw: unknown): AskScope | undefined {
  return raw === "ortopedia" ? raw : undefined;
}

export async function* askGuide(
  question: string,
  history: readonly AskTurn[] = [],
  deps: AskDeps = DEFAULT_DEPS,
  options: { fresh?: boolean; context?: string; scope?: AskScope } = {}
): AsyncGenerator<AskEvent> {
  const context = options.context?.trim().slice(0, 200) || null;
  const key = history.length === 0 && !context ? questionKey(question) : null;
  const store = deps.store;
  if (key && store && !options.fresh) {
    try {
      const hit = await store.get(key, guideVersion());
      if (hit) {
        yield { t: "cached", at: hit.createdAt };
        yield { t: "text", d: hit.answer };
        yield { t: "sources", items: hit.sources };
        yield { t: "done" };
        return;
      }
    } catch (error) {
      console.error("guia: memória de respostas indisponível", error);
    }
  }

  const seen = new Map<string, GuideChunk>();
  const lastUser = [...history].reverse().find((h) => h.role === "user")?.content ?? "";
  const [initial, extra] = await Promise.all([
    deps.retrieve(context ? `${context} ${question}` : question, 6),
    lastUser ? deps.retrieve(`${lastUser} ${question}`, 3) : Promise.resolve([]),
  ]);
  for (const c of [...initial, ...extra]) seen.set(c.id, c);

  const contents: GeminiContent[] = [
    ...history.slice(-6).map((h) => ({ role: h.role === "user" ? ("user" as const) : ("model" as const), parts: [{ text: h.content }] })),
    {
      role: "user",
      parts: [
        {
          text:
            `Pergunta: ${question}\n\n` +
            (context ? `Contexto: o médico está na tela "${context}" do app.\n\n` : "") +
            `Trechos do guia já encontrados para esta pergunta:\n\n${chunksBlock([...seen.values()])}`,
        },
      ],
    },
  ];

  let answer = "";
  let cut = false;
  for (let turn = 0; turn <= MAX_SEARCHES; turn++) {
    const parts: GeminiPart[] = [];
    for await (const chunk of deps.generate({ system: SYSTEM, contents, tools: turn < MAX_SEARCHES ? [TOOL] : [] })) {
      if (chunk.blocked) {
        yield { t: "error", m: "A IA não respondeu a esta pergunta. Consulte o tópico no guia." };
        return;
      }
      if (chunk.finishReason === "MAX_TOKENS") cut = true;
      for (const part of chunk.parts) {
        parts.push(part);
        if (part.text && !part.thought) {
          answer += part.text;
          yield { t: "text", d: part.text };
        }
      }
    }
    const calls = parts.filter((p) => p.functionCall);
    if (calls.length === 0) break;
    contents.push({ role: "model", parts });
    const results: GeminiPart[] = [];
    for (const call of calls) {
      const q = String(call.functionCall?.args?.consulta ?? "").slice(0, 200);
      yield { t: "search", q };
      const found = await deps.retrieve(q, 6);
      for (const c of found) seen.set(c.id, c);
      results.push({ functionResponse: { name: TOOL.name, response: { trechos: chunksBlock(found) } } });
    }
    contents.push({ role: "user", parts: results });
  }

  if (!answer.trim()) {
    yield { t: "error", m: "A IA não trouxe resposta. Use a busca ou abra o tópico." };
    return;
  }
  if (cut) {
    const note = "\n\n(Resposta cortada pelo limite de tamanho — abra o tópico citado para o texto completo.)";
    answer += note;
    yield { t: "text", d: note };
  }
  const items = citedIds(answer)
    .map((id) => seen.get(id) ?? chunkById(id))
    .filter((c): c is GuideChunk => Boolean(c))
    .map((c) => ({ id: c.id, slug: c.slug, topic: c.topic, section: c.section, source: c.source as ChunkSource, href: c.href }));
  yield { t: "sources", items };
  if (key && store && !cut && items.length > 0) {
    try {
      await store.save(key, guideVersion(), question, { answer, sources: items });
    } catch (error) {
      console.error("guia: não consegui guardar a resposta", error);
    }
  }
  yield { t: "done" };
}
