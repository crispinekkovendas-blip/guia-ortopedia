// Prepara as imagens de referência para o site e o app:
//   - lê a pasta curada (padrão: C:/Users/admin/XGLA/Software/MEDAPP/ortho-refs, uma subpasta
//     por procedimento com credits.json — ver scripts/images/README.md);
//   - reduz cada imagem a no máximo 1600 px (JPEG q82; PNG/SVG de esquema ficam PNG) em
//     public/imagens/<slug>/<nn>-<arquivo>;
//   - grava src/lib/images.json com título, autor, licença, página e tamanho.
// Uso: node scripts/images/build.mjs [pasta-das-referências]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "../..");
const SRC = process.argv[2] ?? "C:/Users/admin/XGLA/Software/MEDAPP/ortho-refs";
const OUT = resolve(ROOT, "public/imagens");
const MAX = 1600;

const guide = await import(pathToFileURL(resolve(ROOT, "src/lib/ortho-guide/index.ts")).href);
const procs = [];
for (const c of guide.ORTHO_GUIDE) for (const t of c.topics) (t.procedures ?? []).forEach((p, k) => procs.push({ n: procs.length + 1, slug: t.slug, k: k + 1, name: p.name }));

const credits = JSON.parse(readFileSync(join(SRC, "credits.json"), "utf8"));
const FREE = /^(CC BY(-SA)?( [0-9.]+)?( [a-z]{2})?|CC0|Public domain|No restrictions)$/i;
rmSync(OUT, { recursive: true, force: true });
const out = [];
let total = 0, skipped = 0;
for (const p of procs) {
  const entry = credits.find((c) => c.n === p.n);
  const dir = entry ? join(SRC, basename(entry.dir)) : null;
  const images = [];
  if (entry && dir && existsSync(dir)) {
    const present = new Set(readdirSync(dir));
    for (const img of entry.images) {
      if (!present.has(img.file)) continue;
      if (!FREE.test(img.license)) { skipped++; continue; }
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
        images.push({ file: name, src: `/imagens/${p.slug}/${name}`, title: img.title.replace(/\.[a-z0-9]+$/i, ""), author: img.author, license: img.license, page: img.page, w: info.width, h: info.height });
        total++;
      } catch (e) {
        console.warn(`pulei ${img.file}: ${e.message}`);
      }
    }
  }
  out.push({ slug: p.slug, n: p.n, k: p.k, name: p.name, images });
}
writeFileSync(resolve(ROOT, "src/lib/images.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`${total} imagens em public/imagens (${skipped} fora por licença), ${out.filter((p) => p.images.length).length}/${procs.length} procedimentos com imagem`);
