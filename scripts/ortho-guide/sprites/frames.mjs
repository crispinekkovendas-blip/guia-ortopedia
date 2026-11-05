// Quadros parados da animação de cada procedimento, para o PDF (onde a animação não roda):
// cada SVG é congelado em quatro instantes do ciclo (antes, aproximação, auge, final) com a
// Web Animations API e fotografado pelo Chrome headless, depois reduzido a JPEG de 800 px.
// Saída: public/ortho/procedures/frames/<slug>-<k>-<1..4>.jpg
// Uso: node scripts/ortho-guide/sprites/frames.mjs [--only <slug>]  (precisa do Chrome)
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "../../..");
const DIR = resolve(ROOT, "public/ortho/procedures");
const OUT = resolve(DIR, "frames");
const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
/** Os instantes (s) do ciclo de 6 s: repouso, aproximação (camada 1), auge da manobra (camada 2), final (camada 3). */
export const TIMES = [0.4, 1.8, 3.3, 4.8];
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

const files = readdirSync(DIR).filter((f) => f.endsWith(".svg") && (!only || f.startsWith(only))).sort();
const work = resolve(tmpdir(), "renova-frames-work"); rmSync(work, { recursive: true, force: true }); mkdirSync(work, { recursive: true });
mkdirSync(OUT, { recursive: true });

const page = (svg, t) => `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{width:1200px;height:800px;display:block}</style></head><body>${svg.replace("@media (prefers-reduced-motion:reduce),print{.a{animation:none!important}}", "")}
<script>document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ${Math.round(t * 1000)}; });</script></body></html>`;

const shoot = (html, png, i) => new Promise((res) => {
  const c = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${join(work, `p${i}`)}`, "--window-size=1200,800", "--hide-scrollbars", "--virtual-time-budget=3000",
    `--screenshot=${png}`, pathToFileURL(html).href], { stdio: "ignore" });
  c.on("exit", res);
});

const jobs = [];
for (const f of files) {
  const svg = readFileSync(join(DIR, f), "utf8"), base = f.replace(/\.svg$/, "");
  TIMES.forEach((t, k) => {
    const html = join(work, `${base}-${k + 1}.html`); writeFileSync(html, page(svg, t), "utf8");
    jobs.push({ html, png: join(work, `${base}-${k + 1}.png`), jpg: join(OUT, `${base}-${k + 1}.jpg`) });
  });
}
for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map((j, k) => shoot(j.html, j.png, k)));
let n = 0;
for (const j of jobs) {
  try { await sharp(j.png).resize({ width: 800 }).jpeg({ quality: 86, mozjpeg: true }).toFile(j.jpg); n++; } catch (e) { console.warn(`falhou ${j.png}: ${e.message}`); }
}
rmSync(work, { recursive: true, force: true });
console.log(`${n} quadros em ${OUT} (${files.length} sprites × ${TIMES.length})`);
