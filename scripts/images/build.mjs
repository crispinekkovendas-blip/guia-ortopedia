// Prepara as imagens de referência para o site e o app:
//   - lê as pastas curadas (padrão: MEDAPP/ortho-refs, do Commons, e MEDAPP/ortho-refs-epmc, do
//     Europe PMC): uma subpasta por procedimento com credits.json; um rejected.txt na subpasta
//     (um nome de arquivo por linha) tira a figura da curadoria;
//   - reduz cada imagem a no máximo 1600 px (JPEG q82; PNG/SVG de esquema ficam PNG) em
//     public/imagens/<slug>/<nn>-<arquivo>;
//   - grava src/lib/images.json com título, autor, licença, página e tamanho.
// Uso: node scripts/images/build.mjs [pasta1 pasta2 …]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "../..");
const SRCS = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (SRCS.length === 0) SRCS.push("C:/Users/admin/XGLA/Software/MEDAPP/ortho-refs", "C:/Users/admin/XGLA/Software/MEDAPP/ortho-refs-epmc");
const OUT = resolve(ROOT, "public/imagens");
const MAX = 1600;

const guide = await import(pathToFileURL(resolve(ROOT, "src/lib/ortho-guide/index.ts")).href);
const procs = [];
for (const c of guide.ORTHO_GUIDE) for (const t of c.topics) (t.procedures ?? []).forEach((p, k) => procs.push({ n: procs.length + 1, slug: t.slug, k: k + 1, name: p.name }));

const FREE = /^(CC BY(-SA)?( [0-9.]+)?( [a-z]{2})?|CC0|Public domain|No restrictions)$/i;
// As fontes: cada pasta tem credits.json na raiz (lista por procedimento, com `dir`) ou só as subpastas.
const sources = SRCS.filter((d) => existsSync(d)).map((d) => {
  const root = join(d, "credits.json");
  const list = existsSync(root) ? JSON.parse(readFileSync(root, "utf8")) : readdirSync(d).filter((x) => existsSync(join(d, x, "credits.json"))).map((x) => ({ ...JSON.parse(readFileSync(join(d, x, "credits.json"), "utf8")), dir: join(d, x) }));
  return { base: d, list };
});
rmSync(OUT, { recursive: true, force: true });
const out = [];
let total = 0, skipped = 0, rejected = 0;
for (const p of procs) {
  const images = [];
  const seen = new Set();
  for (const src of sources) {
    const entry = src.list.find((c) => c.n === p.n && (c.k == null || c.k === p.k));
    const dir = entry ? (existsSync(entry.dir) ? entry.dir : join(src.base, basename(entry.dir))) : null;
    if (!entry || !dir || !existsSync(dir)) continue;
    const present = new Set(readdirSync(dir));
    const no = new Set(existsSync(join(dir, "rejected.txt")) ? readFileSync(join(dir, "rejected.txt"), "utf8").split("\n").map((x) => x.trim()).filter(Boolean) : []);
    for (const img of entry.images) {
      if (!present.has(img.file) || seen.has(img.file)) continue;
      if (no.has(img.file)) { rejected++; continue; }
      if (!FREE.test(img.license)) { skipped++; continue; }
      seen.add(img.file);
      const srcFile = join(dir, img.file);
      const ext = extname(img.file).toLowerCase();
      const isVector = ext === ".svg";
      const target = isVector || ext === ".png" || ext === ".gif" ? "png" : "jpeg";
      const name = img.file.replace(/\.[^.]+$/, "") + "." + (target === "png" ? "png" : "jpg");
      const destDir = join(OUT, p.slug); mkdirSync(destDir, { recursive: true });
      const dest = join(destDir, name);
      try {
        let s = sharp(srcFile, isVector ? { density: 160 } : {}).rotate().resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });
        s = target === "png" ? s.png({ compressionLevel: 9, palette: false }) : s.jpeg({ quality: 82, mozjpeg: true });
        const info = await s.toFile(dest);
        // Artigo (Europe PMC): o crédito é autores + título do artigo + revista; a legenda vira o título.
        const author = img.article ? `${img.author} — ${img.article} (${img.journal})`.slice(0, 220) : img.author;
        images.push({ file: name, src: `/imagens/${p.slug}/${name}`, title: img.title.replace(/\.[a-z0-9]+$/i, ""), author, license: img.license, page: img.page, w: info.width, h: info.height });
        total++;
      } catch (e) {
        console.warn(`pulei ${img.file}: ${e.message}`);
      }
    }
  }
  out.push({ slug: p.slug, n: p.n, k: p.k, name: p.name, images });
}
writeFileSync(resolve(ROOT, "src/lib/images.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`${total} imagens em public/imagens (${skipped} fora por licença, ${rejected} rejeitadas na curadoria), ${out.filter((p) => p.images.length).length}/${procs.length} procedimentos com imagem`);
