// Colhe figuras CC BY de artigos em acesso aberto no Europe PMC para cada procedimento do guia.
// Para cada procedimento há termos de busca (inglês) e palavras que a legenda precisa ter; as
// figuras que batem são baixadas para <saída>/<nn>-<slug>/ com um credits.json (título do artigo,
// autores, revista, ano, PMCID, licença). Depois a folha de contato serve para a curadoria à mão.
//
// Uso: node scripts/images/epmc.mjs <pasta-de-saída> [--max-articles 25]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUT = process.argv[2] ?? "C:/Users/admin/XGLA/Software/MEDAPP/ortho-refs-epmc";
const MAX_ARTICLES = Number(process.argv[process.argv.indexOf("--max-articles") + 1]) || 25;
// --licenses by (padrão): só CC BY · nc: só as outras CC (BY-NC, BY-NC-SA, BY-SA, BY-ND, BY-NC-ND) · all: todas
const LICENSES = process.argv.includes("--licenses") ? process.argv[process.argv.indexOf("--licenses") + 1] : "by";
const LIC_QUERY = LICENSES === "by" ? '(LICENSE:"cc by" OR LICENSE:"cc-by")'
  : LICENSES === "nc" ? '(LICENSE:"cc by-nc" OR LICENSE:"cc by-nc-sa" OR LICENSE:"cc by-nc-nd" OR LICENSE:"cc by-sa" OR LICENSE:"cc by-nd")'
  : '(LICENSE:"cc by" OR LICENSE:"cc by-nc" OR LICENSE:"cc by-nc-sa" OR LICENSE:"cc by-nc-nd" OR LICENSE:"cc by-sa" OR LICENSE:"cc by-nd")';
/** O nome da licença a partir do texto/URL do artigo ("CC BY-NC-SA 4.0"); null quando não é Creative Commons. */
function licenseName(text) {
  const m = text.match(/creativecommons\.org\/licenses\/(by(?:-nc)?(?:-sa|-nd)?)\/?([0-9.]+)?/i) ?? text.match(/\bCC[ -]?(BY(?:[ -]?NC)?(?:[ -]?SA|[ -]?ND)?)\b[ -]?([0-9.]+)?/i);
  if (!m) return /Creative Commons Attribution/i.test(text) ? (/Non-?Commercial/i.test(text) ? (/Share-?Alike/i.test(text) ? "CC BY-NC-SA" : /No-?Deriv/i.test(text) ? "CC BY-NC-ND" : "CC BY-NC") : /Share-?Alike/i.test(text) ? "CC BY-SA" : /No-?Deriv/i.test(text) ? "CC BY-ND" : "CC BY") : null;
  return `CC ${m[1].toUpperCase().replace(/[ _]/g, "-")}${m[2] ? " " + m[2] : ""}`;
}
const ROOT = resolve(import.meta.dirname, "../..");
const base = "https://www.ebi.ac.uk/europepmc/webservices/rest";

const guide = await import(pathToFileURL(resolve(ROOT, "src/lib/ortho-guide/index.ts")).href);
const procs = [];
for (const c of guide.ORTHO_GUIDE) for (const t of c.topics) (t.procedures ?? []).forEach((p, k) => procs.push({ n: procs.length + 1, slug: t.slug, k: k + 1, name: p.name }));

// Termos por procedimento (n) e o que a legenda precisa conter (qualquer um).
const TECH = ["technique", "reduction", "splint", "cast", "block", "injection", "needle", "landmark", "position", "maneuver", "manoeuvre", "traction", "immobiliz", "immobilis", "radiograph", "x-ray", "before", "after", "dislocation", "fracture", "taping", "brace", "orthosis", "boot", "binder", "sling", "trephin", "nail", "anatom", "approach", "portal", "palpat", "insertion", "procedure", "step"];
const BAD = ["flow diagram", "flowchart", "flow chart", "prisma", "consort", "forest plot", "funnel plot", "kaplan", "survival curve", "roc curve", "bar chart", "histogram", "scatter", "boxplot", "box plot", "meta-analysis", "sensitivity analysis", "risk of bias", "questionnaire", "timeline", "study design", "screening", "ultrasound", "sonogra", "mri", "ct scan", "computed tomography", "arthroscop", "intra-operative", "intraoperative", "surgical", "osteosynthesis", "plate", "screw", "k-wire", "pin ", "cadaver"];
const Q = {
  1: ["distal radius fracture radiograph ABCS systematic reading trauma", "wrist radiograph alignment cortical step fracture"],
  2: ["forearm volar splint plaster technique", "below-knee posterior splint plaster application"],
  3: ["circular cast three-point molding", "cast bivalve technique"],
  4: ["hematoma block distal radius fracture reduction", "haematoma block technique emergency"],
  5: ["digital nerve block technique dorsal approach finger", "digital block finger anesthesia landmark"],
  6: ["fascia iliaca compartment block landmark technique hip fracture", "fascia iliaca block loss of resistance"],
  7: ["procedural sedation emergency department fracture reduction monitoring"],
  8: ["knee arthrocentesis superolateral approach", "knee joint aspiration technique landmark"],
  9: ["subacromial injection posterior approach technique", "subacromial bursa injection landmark"],
  10: ["carpal tunnel corticosteroid injection technique palmaris longus", "carpal tunnel injection landmark"],
  11: ["trigger finger corticosteroid injection A1 pulley technique", "de Quervain injection technique first compartment"],
  12: ["greater trochanteric bursa injection technique", "trochanteric pain syndrome injection landmark"],
  13: ["tetanus prophylaxis wound open fracture"],
  14: ["tibial shaft fracture splint alignment emergency", "long leg splint tibia fracture"],
  15: ["cast bivalve compartment syndrome release", "tight cast splitting"],
  16: ["skin traction femur fracture", "buck traction skin traction technique"],
  17: ["coaptation splint humeral shaft fracture", "sugar tong splint humerus"],
  18: ["Allis maneuver posterior hip dislocation reduction", "posterior hip dislocation closed reduction technique"],
  19: ["ankle fracture dislocation closed reduction emergency", "ankle dislocation reduction technique"],
  20: ["ankle posterior splint stirrup sugar tong", "ankle splint U-shaped technique"],
  21: ["proximal humerus fracture sling pendulum exercise", "Codman pendulum exercise"],
  22: ["pelvic binder application level greater trochanter", "pelvic circumferential compression device sheet"],
  23: ["glenohumeral intra-articular injection posterior approach", "shoulder joint injection landmark posterior"],
  24: ["anterior shoulder dislocation reduction external rotation technique", "Cunningham technique shoulder reduction", "traction countertraction shoulder reduction"],
  25: ["Colles fracture closed reduction technique", "distal radius fracture closed reduction splint radiograph before after"],
  26: ["posterior elbow dislocation closed reduction technique", "elbow dislocation reduction radiograph"],
  27: ["boxer fracture Jahss maneuver reduction", "fifth metacarpal neck fracture ulnar gutter splint"],
  28: ["buddy taping finger", "intrinsic plus position hand splint"],
  29: ["proximal interphalangeal joint dorsal dislocation reduction", "PIP joint dislocation reduction technique"],
  30: ["mallet finger splint stack", "mallet finger extension splint"],
  31: ["subungual hematoma trephination", "subungual haematoma drainage"],
  32: ["nail bed repair laceration technique", "nail bed injury repair suture"],
  33: ["long arm cast child forearm fracture", "above elbow cast pediatric"],
  34: ["supracondylar humerus fracture child splint posterior", "supracondylar fracture Gartland radiograph"],
  35: ["nursemaid elbow reduction hyperpronation", "radial head subluxation reduction technique child"],
  36: ["patellar dislocation reduction technique", "lateral patellar dislocation radiograph reduction"],
  37: ["Achilles tendon rupture functional treatment boot wedges", "Achilles rupture non-operative walking boot heel wedge"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// O Europe PMC devolve 503 quando se pede depressa demais: espera e tenta de novo.
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", accept: "text/html,application/xml,application/json,image/*,*/*;q=0.8" };
async function getRetry(url, as) {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) return as === "json" ? r.json() : r.text();
    if (r.status !== 503 && r.status !== 429) throw new Error(`${r.status} ${url}`);
    await sleep(5000 * (i + 1));
  }
  throw new Error(`503 persistente ${url}`);
}
const getJson = (url) => getRetry(url, "json");
const getText = (url) => getRetry(url, "text");
async function download(url, dest) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: UA });
    if (r.ok) { writeFileSync(dest, Buffer.from(await r.arrayBuffer())); return true; }
    if (r.status === 429) { await sleep(3000 * (i + 1)); continue; }
    return false;
  }
  return false;
}
const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
// As figuras ficam no CDN do PMC com um caminho que só a página do artigo revela: nome do arquivo → URL.
const pageCache = new Map();
async function blobMap(pmcid) {
  if (pageCache.has(pmcid)) return pageCache.get(pmcid);
  const m = new Map();
  try {
    const html = await getText(`https://pmc.ncbi.nlm.nih.gov/articles/${pmcid}/`);
    for (const u of html.matchAll(/https:\/\/cdn\.ncbi\.nlm\.nih\.gov\/pmc\/blobs\/[^"' ]+/g)) {
      const name = u[0].split("/").pop();
      if (!m.has(name.replace(/\.[^.]+$/, "").toLowerCase())) m.set(name.replace(/\.[^.]+$/, "").toLowerCase(), u[0]);
    }
  } catch (e) { console.warn(`página do PMC falhou: ${pmcid}: ${e.message}`); }
  pageCache.set(pmcid, m);
  await sleep(1200);
  return m;
}

mkdirSync(OUT, { recursive: true });
const all = [];
const seenArticles = new Map();
for (const p of procs) {
  const terms = Q[p.n] ?? [p.name];
  const dir = join(OUT, `${String(p.n).padStart(2, "0")}-${p.slug}-${p.k}`);
  mkdirSync(dir, { recursive: true });
  const images = [];
  const seen = new Set();
  for (const t of terms) {
    const q = encodeURIComponent(`(${t}) AND OPEN_ACCESS:y AND ${LIC_QUERY} AND HAS_FT:y`);
    await sleep(1500);
    let j;
    try { j = await getJson(`${base}/search?query=${q}&format=json&pageSize=${MAX_ARTICLES}&resultType=lite&sort=RELEVANCE`); } catch (e) { console.warn(`busca falhou: ${t}: ${e.message}`); continue; }
    for (const a of j.resultList?.result ?? []) {
      if (!a.pmcid || seen.has(a.pmcid)) continue;
      seen.add(a.pmcid);
      let xml = seenArticles.get(a.pmcid);
      if (xml === undefined) {
        try { xml = await getText(`${base}/${a.pmcid}/fullTextXML`); } catch { xml = ""; }
        seenArticles.set(a.pmcid, xml);
        await sleep(900);
      }
      if (!xml) continue;
      // a licença de verdade, no XML
      const lic = strip(xml.match(/<license[^>]*>([\s\S]*?)<\/license>/)?.[1] ?? "");
      const licUrl = xml.match(/<license[^>]*xlink:href="([^"]+)"/)?.[1] ?? "";
      const licName = licenseName(licUrl + " " + lic);
      if (!licName) continue;
      if (LICENSES === "by" && licName.split(" ")[1] !== "BY") continue;
      if (LICENSES === "nc" && licName.split(" ")[1] === "BY") continue;
      const authors = a.authorString ?? "";
      // primeiro as legendas que batem; só então a página do PMC (uma por artigo)
      const wanted = [];
      for (const f of xml.matchAll(/<fig[^>]*>([\s\S]*?)<\/fig>/g)) {
        const cap = strip(f[1].match(/<caption>([\s\S]*?)<\/caption>/)?.[1] ?? "");
        const href = f[1].match(/<graphic[^>]*xlink:href="([^"]+)"/)?.[1];
        if (!href || /\.(mp4|avi|mov)$/i.test(href)) continue;
        const lc = cap.toLowerCase();
        if (!TECH.some((w) => lc.includes(w)) || BAD.some((w) => lc.includes(w))) continue;
        wanted.push({ cap, href });
      }
      if (wanted.length === 0) continue;
      const map = await blobMap(a.pmcid);
      for (const { cap, href } of wanted) {
        const url = map.get(href.replace(/\.[^.]+$/, "").toLowerCase());
        if (!url) continue;
        const ext = (url.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z]/g, "") || "jpg";
        const file = `${a.pmcid}-${href.replace(/\.[^.]+$/, "").replace(/[^\w.-]/g, "_")}.${ext}`;
        const dest = join(dir, file);
        if (!existsSync(dest)) {
          const ok = await download(url, dest);
          if (!ok) continue;
          await sleep(500);
        }
        images.push({ file, title: cap.slice(0, 240), author: authors, license: licName, page: `https://pmc.ncbi.nlm.nih.gov/articles/${a.pmcid}/`, article: a.title, journal: `${a.journalTitle ?? ""} ${a.pubYear ?? ""}`.trim(), pmcid: a.pmcid });
      }
      if (images.length >= 30) break;
    }
    if (images.length >= 30) break;
  }
  writeFileSync(join(dir, "credits.json"), JSON.stringify({ n: p.n, slug: p.slug, k: p.k, name: p.name, images }, null, 1));
  all.push({ n: p.n, slug: p.slug, k: p.k, name: p.name, dir, images });
  console.log(`${String(p.n).padStart(2)} ${p.name.slice(0, 60).padEnd(60)} ${images.length} figuras`);
}
writeFileSync(join(OUT, "credits.json"), JSON.stringify(all, null, 1));
console.log(`total: ${all.reduce((s, p) => s + p.images.length, 0)} figuras em ${OUT}`);
