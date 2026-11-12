# As imagens de referência

Fotos, radiografias e esquemas que mostram como a lesão se apresenta, o
resultado da redução ou da imobilização e o material. A técnica em si está
nas ilustrações animadas (ver `ilustracoes.md`). Hoje: 133 imagens em 36 dos
37 procedimentos.

## Onde vivem

- **Pasta curada** (fora do repo): `C:\Users\admin\XGLA\Software\MEDAPP\ortho-refs\`
  (Wikimedia Commons) e `…\ortho-refs-epmc\` (Europe PMC, vazia até a
  colheita voltar). Uma subpasta por procedimento (`<nn>-<slug>`) com
  `credits.json` (arquivo, título, autor, licença, página de origem) e,
  opcionalmente, `rejected.txt` (um nome de arquivo por linha: fica fora).
- **Legendas em português**: `scripts/images/titulos-pt.json` — mapa do
  título original para a legenda. O build usa a legenda como `title` e guarda
  o original em `original` (vai no crédito e no tooltip). Imagem nova sem
  legenda: o build avisa `sem legenda em português: …` e usa o original.
- **Saída**: `public/imagens/<slug>/<nn>-<arquivo>.(jpg|png)` (máx. 1600 px;
  JPEG q82; esquemas PNG/SVG viram PNG) e `src/lib/images.json`
  (`ProcedureImages[]`: slug, n, k, name, images[]).

## Gerar

```
npm run images                 # lê as duas pastas padrão
node scripts/images/build.mjs <pasta1> <pasta2>   # outras pastas
```

Licenças aceitas (`FREE` em `build.mjs`): qualquer Creative Commons (BY,
BY-SA, BY-ND, BY-NC, BY-NC-SA, BY-NC-ND), CC0, domínio público, "No
restrictions". Rótulos em inglês viram "Domínio público" e "Sem restrições".
Fontes com todos os direitos reservados não entram.

## Folha de contato (curadoria)

```
node scripts/images/sheet.mjs <pasta> <saida.html> [--png]
```

Miniaturas com legenda e nome do arquivo, por procedimento; `--png` fotografa
com o Chrome headless (12 procedimentos por página). Serve para decidir o que
vai para `rejected.txt`.

## Onde aparecem

- Site: no fim do tópico (`topic-images.tsx`, por procedimento) e em
  `/imagens` (todas, com a contagem por licença). Cada imagem abre em tamanho
  cheio em nova aba; o crédito tem autor e a licença linkada à página de
  origem.
- App: `images[]` de cada tópico no pacote (`src` absoluto); o app baixa com
  as ilustrações para `filesDir/sprites` e mostra em `ReferenceImageCard`
  (pinça/arrasto em `ZoomableImage`). `ortopedia.spritesVersion` muda quando
  a lista de `src` muda e o app baixa tudo de novo.
- PDF: não leva as imagens de referência (só os quadros das animações).

## Colheita no Europe PMC (parada)

`scripts/images/epmc.mjs <saída> [--max-articles N] [--licenses by|nc|all]`
busca artigos em acesso aberto por termos de cada procedimento, lê o XML
completo, baixa as figuras cuja legenda tem as palavras esperadas (blobs do
CDN do PMC via a página do artigo) e grava `credits.json`. O workflow
`imagens-epmc.yml` roda isso no GitHub (entradas `max_articles`, `licenses`)
e publica a pasta como artefato para curadoria.

Parou em 2026-11-05: a busca do Europe PMC devolveu 503 por horas (do GitHub
e daqui, mesmo sem filtros) e o esearch do NCBI caiu na mesma janela
("Cannot connect to SOLR"); `europepmc.org/bin` e Radiopaedia dão 403. O
usuário mandou publicar sem. Para retomar: rodar o workflow, curar com a folha
de contato, escrever as legendas em `titulos-pt.json` e `npm run images`.
