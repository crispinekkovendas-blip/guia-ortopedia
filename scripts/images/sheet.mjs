// Folha de contato de uma pasta de referências (credits.json por procedimento) para a curadoria:
// miniaturas com legenda e nome do arquivo, por procedimento. Com --png, fotografa com o Chrome
// headless em páginas de 12 procedimentos (precisa do Chrome).
// Uso: node scripts/images/sheet.mjs <pasta> <saida.html> [--png]
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const [dir, out] = process.argv.slice(2);
if (!dir || !out) { console.error("uso: node scripts/images/sheet.mjs <pasta> <saida.html> [--png]"); process.exit(1); }
const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const procs = readdirSync(dir).filter((d) => existsSync(join(dir, d, "credits.json"))).sort();
const pages = [];
for (let i = 0; i < procs.length; i += 12) {
  const cards = procs.slice(i, i + 12).map((d) => {
    const c = JSON.parse(readFileSync(join(dir, d, "credits.json"), "utf8"));
    const rejected = new Set(existsSync(join(dir, d, "rejected.txt")) ? readFileSync(join(dir, d, "rejected.txt"), "utf8").split(/\r?\n/).filter(Boolean) : []);
    const imgs = c.images.map((img, k) => `<figure class="${rejected.has(img.file) ? "no" : ""}"><img src="${pathToFileURL(join(dir, d, img.file)).href}" loading="eager"><figcaption><b>${k + 1}</b> ${esc(img.file)}<br>${esc((img.title ?? "").slice(0, 140))}<br><i>${esc((img.article ?? img.author ?? "").slice(0, 90))}</i></figcaption></figure>`).join("");
    return `<section><h2>${esc(d)} · ${esc(c.name ?? "")} · ${c.images.length}</h2><div class="g">${imgs || "<p>sem figuras</p>"}</div></section>`;
  }).join("");
  pages.push(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>body{font-family:Segoe UI,Arial;margin:12px;background:#fff;font-size:11px}h2{font-size:14px;margin:14px 0 6px;border-top:2px solid #1c2a4a;padding-top:6px}.g{display:flex;flex-wrap:wrap;gap:6px}figure{width:150px;margin:0}figure.no{opacity:.25}img{width:150px;height:110px;object-fit:contain;background:#eef;border:1px solid #ccd}figcaption{line-height:1.2;overflow:hidden;max-height:62px}</style></head><body>${cards}</body></html>`);
}
pages.forEach((html, i) => writeFileSync(out.replace(/\.html$/, `-${i + 1}.html`), html, "utf8"));
console.log(`${procs.length} procedimentos em ${pages.length} páginas: ${out.replace(/\.html$/, "-N.html")}`);
if (process.argv.includes("--png")) {
  const chrome = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
  await Promise.all(pages.map((_, i) => new Promise((res) => {
    const html = resolve(out.replace(/\.html$/, `-${i + 1}.html`));
    const c = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${join(tmpdir(), `renova-sheet-${i}`)}`, "--window-size=1400,4200", "--hide-scrollbars", "--virtual-time-budget=15000",
      `--screenshot=${html.replace(/\.html$/, ".png")}`, pathToFileURL(html).href], { stdio: "ignore" });
    c.on("exit", res);
  })));
  console.log("png ok");
}
