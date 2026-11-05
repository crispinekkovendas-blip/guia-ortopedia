import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkById, guideChunks, retrieveChunks, formatChunk } from "./guide-chunks.ts";
import { askGuide, SYSTEM, citedIds } from "./guide-ask.ts";
import { memoryStore, questionKey } from "./guide-answer-cache.ts";

test("os trechos cobrem o guia e a cola, com ids únicos e caminho para abrir", () => {
  const chunks = guideChunks();
  const ids = new Set(chunks.map((c) => c.id));
  assert.equal(ids.size, chunks.length);
  assert.ok(chunks.filter((c) => c.id.startsWith("orto-")).length >= 54 * 3);
  assert.ok(chunks.filter((c) => c.id.startsWith("cola-")).length >= 90);
  for (const c of chunks) assert.match(c.href, /^\/(guia|cola)/);
  assert.ok(formatChunk(chunks[0]).startsWith('<trecho id="orto-'));
});

test("a busca por palavra acha o tópico e o texto da cola", () => {
  const ombro = retrieveChunks("luxação anterior do ombro redução", 6).map((c) => c.id);
  assert.ok(ombro.some((id) => id.startsWith("orto-luxacao-e-instabilidade-do-ombro#")), ombro.join(", "));
  const cola = retrieveChunks("texto de prontuário lombalgia aguda", 6).map((c) => c.id);
  assert.ok(cola.some((id) => id.startsWith("cola-pront-lombalgia")), cola.join(", "));
  assert.ok(chunkById("orto-entorse-de-tornozelo#1"));
});

test("a pergunta anexa trechos, cita as fontes e guarda a resposta na memória", async () => {
  const seenRequests = [];
  const deps = {
    async *generate(req) {
      seenRequests.push(req);
      yield { parts: [{ text: "RICE e tornozeleira [[orto-entorse-de-tornozelo#1]]. Dose: **dipirona 1 g** [[orto-entorse-de-tornozelo#2]]" }], finishReason: "STOP" };
    },
    retrieve: async (q, limit) => retrieveChunks(q, limit),
    store: memoryStore(),
  };
  const events = [];
  for await (const e of askGuide("Entorse de tornozelo: o que faço no plantão?", [], deps)) events.push(e);
  assert.equal(events.at(-1).t, "done");
  const sources = events.find((e) => e.t === "sources").items;
  assert.deepEqual(sources.map((s) => s.id), ["orto-entorse-de-tornozelo#1", "orto-entorse-de-tornozelo#2"]);
  assert.equal(sources[0].href, "/guia/entorse-de-tornozelo");
  assert.ok(seenRequests[0].system === SYSTEM && seenRequests[0].contents[0].parts[0].text.includes("<trecho id="));
  // a mesma pergunta volta da memória, sem chamar a IA
  const again = [];
  for await (const e of askGuide("Entorse de tornozelo: o que faço no plantão?", [], deps)) again.push(e);
  assert.equal(again[0].t, "cached");
  assert.equal(seenRequests.length, 1);
  assert.deepEqual(citedIds("a [[x#1]] b [[y#2]] [[x#1]]"), ["x#1", "y#2"]);
  assert.equal(questionKey("dose?"), null);
});
