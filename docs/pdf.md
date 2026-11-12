# O PDF de estudo

`public/pdf/Guia-de-ortopedia.pdf` (232 páginas, ~9,7 MB), linkado do site. É
o guia inteiro para ler no computador ou imprimir: como usar, sumário, os
capítulos e tópicos, apêndices A (índice de manobras), B (índice de
medicamentos) e C (cola do plantão).

## Gerador

Vive **fora do repositório**: `C:\Users\admin\XGLA\Software\MEDAPP\ortho-pdf.mjs`.
Lê o texto do guia, a cola e os quadros das animações **deste produto**
(`PRODUCT`), e usa o `node_modules` do RenovaAPP (`PROJECT`) só pelas
dependências (`pdf-lib`). Precisa do Chrome (`CHROME`, porta 9333).

```
node C:/Users/admin/XGLA/Software/MEDAPP/ortho-pdf.mjs
```

Saída: `MEDAPP/Guia-de-ortopedia-Renova-3a-revisao.pdf` e a cópia em
`GuiaOrtopedia/public/pdf/Guia-de-ortopedia.pdf`. O console mostra páginas,
seções, tópicos, procedimentos e as seções mais longas.

## Como é feito

1. Monta um HTML (`lang="pt-BR"`, CSS próprio) com todas as seções, cada uma
   com `id` (tópico = slug; capítulos `cap-N`; `sumario`, `indice-manobras`,
   `indice-medicamentos`, `cola`).
2. Cada procedimento recebe uma grade 2×2 com os quadros
   `public/ortho/procedures/frames/<slug>-<k>-<1..4>.jpg` (gere antes com
   `frames.mjs`, ver `ilustracoes.md`) e os rótulos "1 · antes", "2 ·
   aproximação", "3 · a manobra", "4 · como termina".
3. O Chrome headless imprime em PDF; âncoras internas viram links `/GoTo`
   (sumário, listas de capítulo, "Sumário ↑" em cada tópico, índices, cola →
   tópico).
4. `pdf-lib` acrescenta os marcadores (`/Outlines`: Como usar, Sumário, um por
   capítulo com os tópicos dentro, A, B, C) e `PageMode UseOutlines`, e grava
   o título do documento.

## Quando regenerar

- Mudou texto, cola ou fontes → regenerar e commitar a cópia em `public/pdf/`.
- Mudou uma ilustração → `npm run sprites`, `frames.mjs`, regenerar.
- O PDF **não** leva as imagens de referência nem a Super Inteligência.

## Conferir

`pdftotext -layout public/pdf/Guia-de-ortopedia.pdf - | grep -iE "\b(the|and|guideline)\b"`
deve voltar vazio (tudo em português). Abra o PDF e teste um link do sumário e
um marcador.
