// Gera os arquivos que os testes do app Android usam (não vão para o git):
//   - o pacote do guia, igual ao que /api/app/guia serve (testes de unidade e emulador);
//   - as respostas do motor de busca do SITE para ~40 consultas de ortopedia, para o porte
//     em Kotlin provar que acha a mesma coisa, na mesma ordem (SmartSearchGoldenTest).
// Uso: node scripts/app/export-fixtures.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { appBundle } from "../../src/lib/app-bundle.ts";
import { buildIndex, completeWord, search, tokens } from "../../src/lib/smart-search.ts";
import { searchKey } from "../../src/lib/normalize.ts";

const { bundle, json } = appBundle();
const TEST_RES = "android/app/src/test/resources";
const ANDROID_ASSETS = "android/app/src/androidTest/assets";
for (const dir of [TEST_RES, ANDROID_ASSETS]) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/guia.json`, json);
}

const QUERIES = [
  "entorse de tornozelo", "tornozelo", "torceu o pé", "joelho inchado", "lachman", "ombro luxado", "luxação do ombro", "colles", "punho",
  "fratura exposta", "síndrome compartimental", "gesso apertado", "dedo em martelo", "dedo em gatilho", "túnel do carpo", "lombalgia",
  "ciática", "dor no quadril", "fratura de quadril idoso", "criança não mexe o braço", "pronação dolorosa", "supracondiliana",
  "aquiles", "tendão", "raio-x", "como pedir o raio-x", "tala", "bloqueio digital", "infiltração", "triancinolona", "dipirona",
  "S93", "s93", "M54", "entors", "luxa", "fratur", "xyzqwk", "ombro ", "dor no ombro ao levantar o braço",
];

const index = buildIndex(bundle.search.docs);
const queries = QUERIES.map((q) => {
  const result = search(index, q);
  return {
    q,
    hits: result.hits.slice(0, 12).map((h) => ({ id: h.id, score: h.score, complete: h.complete, terms: [...h.terms].sort() })),
    total: result.hits.length,
    suggestion: result.suggestion,
    complete: completeWord(index, q),
  };
});

const NORMALIZE = [
  "Entorse de tornozelo", "Dipirona 500 mg · Cloreto de sódio 0,9% nasal", "AÇÃO ÇÃO àéîõü", "x^2 + y`", "mg·kg", "São João d'Ávila",
  "S93.4 / M54.5", "  muitos   espaços  ", "℃ ½ ² Ⅳ", "İstanbul ß", "naïve café", "ÁGUA-viva (picada)", "“aspas” — travessão",
];
const normalize = NORMALIZE.map((s) => ({ in: s, key: searchKey(s), tokens: tokens(s) }));

writeFileSync(`${TEST_RES}/search-golden.json`, JSON.stringify({ version: bundle.version, normalize, queries, unified: [] }, null, 1));
console.log(`pacote ${bundle.version} (${(json.length / 1024).toFixed(0)} KB) · ${queries.length} consultas`);
