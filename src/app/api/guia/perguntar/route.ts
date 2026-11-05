import { askGuide, guideAiEnabled, MAX_QUESTION, parseScope } from "@/lib/guide-ask";
import type { AskTurn } from "@/lib/guide-ask";

/**
 * Pergunta ao Guia de ortopedia: responde em NDJSON (um evento por linha),
 * para a tela mostrar a busca e escrever a resposta enquanto ela chega. Sem
 * conta: o guia é público. Aceita o Bearer do app (ignorado) e o site.
 * O limite por endereço e por instância segura o custo da chave.
 */

export const maxDuration = 60;

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 30;
const recent = new Map<string, number[]>();

function allowed(who: string): boolean {
  const now = Date.now();
  const list = (recent.get(who) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return false;
  list.push(now);
  recent.set(who, list);
  if (recent.size > 5000) recent.delete(recent.keys().next().value!);
  return true;
}

function parseHistory(raw: unknown): AskTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is AskTurn => !!t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.length < 4000)
    .slice(-6);
}

export async function POST(request: Request) {
  if (!guideAiEnabled()) return Response.json({ error: "A IA não está configurada neste site." }, { status: 503 });

  let body: { question?: unknown; history?: unknown; fresh?: unknown; context?: unknown; scope?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pergunta inválida." }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > MAX_QUESTION) {
    return Response.json({ error: `Escreva a pergunta (até ${MAX_QUESTION} caracteres).` }, { status: 400 });
  }
  const who = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anon";
  if (!allowed(who)) {
    return Response.json({ error: "Muitas perguntas seguidas. Tente de novo em alguns minutos." }, { status: 429 });
  }

  const history = parseHistory(body.history);
  const context = typeof body.context === "string" ? body.context.trim().slice(0, 200) : undefined;
  const scope = parseScope(body.scope);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        for await (const event of askGuide(question, history, undefined, { fresh: body.fresh === true, context, scope })) {
          if (request.signal.aborted) break;
          send(event);
        }
      } catch (error) {
        console.error("guia/perguntar", error);
        send({ t: "error", m: "Não foi possível responder agora. Use a busca ou abra o tópico." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
