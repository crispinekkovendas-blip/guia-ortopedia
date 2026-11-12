# As ilustrações animadas dos procedimentos

Cada um dos 37 procedimentos tem um SVG desenhado em código e animado com
CSS: a deformidade, a aproximação, a manobra e como termina, num ciclo de
6 segundos. Aparecem no site (tópico), no app (WebView sem JavaScript) e no
PDF (quatro quadros parados).

## Arquivos

| Onde | O quê |
| --- | --- |
| `scripts/ortho-guide/sprites/lib.mjs` | O motor: paleta `C`, tela 1200×800, primitivas (`path`, `circle`, `rect`, `line`, `arrow`, `arc`, `text`, `label`, `panel`, `step`), anatomia (`limb`, `limbPoly`, `bone`, `fracture`, `hand`), animação (`anim`, `pivot`, `chain`, `along`, `spotlight`). |
| `part1.mjs`, `part2.mjs`, `part3.mjs` | Os 37 desenhos, por slug e k (um export por procedimento). |
| `build.mjs` | Gera `public/ortho/procedures/<slug>-<k>.svg` e uma folha de contato em scratch. `npm run sprites`. |
| `frames.mjs` | Congela cada SVG em 4 instantes (0,4 · 1,8 · 3,3 · 4,8 s) com a Web Animations API no Chrome headless → `public/ortho/procedures/frames/<slug>-<k>-<1..4>.jpg` (800 px). Precisa do Chrome. `node scripts/ortho-guide/sprites/frames.mjs [--only <slug>]`. |
| `src/lib/ortho-guide/index.ts` | `SPRITES_VERSION` e `procedureImage(slug, k)`. |

## Como a animação funciona

- `D = 6` s é o ciclo; `anim(cls, vars, …filhos)` envolve um grupo numa classe
  com `@keyframes` definidos no `<style>` do SVG; `pivot(px, py, …)` roda em
  torno de um ponto; `chain(segmentos, { anim })` anima um membro articulado
  (segmentos encadeados com `from`, `cls`, `vars`, `pivot`, `extra`).
- Ajudas automáticas: empurrão (`nudge`), traço que se desenha (`draw`),
  pulso, piscar; seringa que entra e injeta; camadas `in1/in2/in3`; holofote
  (`spotlight`) no painel ativo.
- O `<style>` traz `@media (prefers-reduced-motion: reduce), print { .a {
  animation: none !important } }` — no PDF e para quem desligou animações, a
  figura fica parada no primeiro quadro.
- Texto e setas que devem ficar parados usam `still: true`.

## Versão

`SPRITES_VERSION` (hoje 3) entra no nome do PNG antigo e em
`ortopedia.spritesVersion` do pacote do app, junto com a lista de imagens.
Mudou a versão ou a lista: o app apaga `filesDir/sprites` e baixa tudo de
novo, sem APK novo. Ao redesenhar uma ilustração, suba a versão.

## Gotchas

- Este PC tem as animações do Windows desligadas: o Chrome headless honra
  `prefers-reduced-motion` e tudo parece parado. `frames.mjs` e a prévia
  retiram essa regra antes de fotografar; no site e no app a animação roda.
- Toque para ampliar: no site a ilustração abre em tamanho cheio em nova aba;
  no app `SpriteView` → `ZoomDialog` (WebView com pinça).
- Depois de `npm run sprites`, rode `frames.mjs` e regenere o PDF (ver `pdf.md`).
