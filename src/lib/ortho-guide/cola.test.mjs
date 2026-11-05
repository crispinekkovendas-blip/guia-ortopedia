import { test } from "node:test";
import assert from "node:assert/strict";
import { COLA, COLA_GROUPS, colaByGroup, colaForTopic } from "./cola.ts";
import { orthoSlugs } from "./index.ts";

test("a cola do plantão: ids únicos, grupos conhecidos e tópicos que existem no guia", () => {
  const ids = new Set();
  const groups = new Set(COLA_GROUPS.map((g) => g.id));
  const slugs = new Set(orthoSlugs());
  for (const c of COLA) {
    assert.ok(!ids.has(c.id), `id repetido: ${c.id}`);
    ids.add(c.id);
    assert.ok(groups.has(c.group), `${c.id}: grupo ${c.group}`);
    assert.ok(c.title.trim() && c.text.trim().length > 20, `${c.id}: título ou texto vazio`);
    if (c.topic) assert.ok(slugs.has(c.topic), `${c.id}: tópico ${c.topic} não existe`);
  }
  assert.ok(COLA.length >= 40);
  for (const g of COLA_GROUPS) assert.ok(colaByGroup(g.id).length >= 1, `grupo ${g.id} vazio`);
  assert.ok(colaForTopic("entorse-de-tornozelo").length >= 2);
  assert.equal(colaForTopic("nao-existe").length, 0);
});

test("a cola não leva nada de um paciente específico", () => {
  for (const c of COLA) {
    assert.doesNotMatch(c.text, /@|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|policlínica zona norte/i, `${c.id} traz dado específico`);
  }
});
