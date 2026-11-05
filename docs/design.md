# Guia de Ortopedia — desenho do projeto (2026-11-05)

## Para quê

O Guia de ortopedia nasceu dentro do Renova (Guia clínico › Ortopedia) para o
médico que assume a vaga de ortopedia no SUS e é, ali, o ortopedista de plantão
e de ambulatório. Este repositório o torna um produto próprio: um site e um app
Android só dele, sem conta, com os 37 procedimentos ilustrados e animados e
**todas as imagens de referência com licença livre que foi possível reunir**.

## O que é

- **Site** (Next.js 15, sem banco, sem login): índice com busca, tópico na
  ordem da consulta, consulta guiada com nota SOAP, revisões (antes/agora/
  motivo), galeria de imagens por tópico e procedimento, página do app.
- **App Android** (o código do Guia Renova, Kotlin/Compose): só a aba Ortopedia;
  abre sem conta, baixa o pacote de `/api/app/guia`, guarda e funciona sem
  internet; baixa as ilustrações (SVG animado, num WebView sem JavaScript) e as
  imagens de referência uma vez e as mostra no tópico.
- **Imagens**: fotos, radiografias e esquemas com licença livre (CC BY, CC
  BY-SA, CC0, domínio público), com autor, licença e página de origem em cada
  uma; nada com cláusula não comercial. Curadas em
  `C:\Users\admin\XGLA\Software\MEDAPP\ortho-refs\` (fora do repo),
  reduzidas a 1600 px por `scripts/images/build.mjs`.

## O que fica de fora (por decisão)

- Plantão, Receitas prontas e Drive de prescrições (conteúdo licenciado do
  Renova): não entram. O pacote do app leva essas abas vazias.
- Super Inteligência (Gemini) e "Escutar o paciente": precisam do servidor do
  Renova; fora desta versão.
- Conta e token: o guia é público; o app abre direto.

## Como se liga ao Renova

O texto do guia (`src/lib/ortho-guide/`), o motor de busca
(`smart-search.ts`), as ilustrações (`scripts/ortho-guide/sprites/`) e o app
Android são cópias do RenovaAPP em 2026-11-05. Mudanças no texto feitas lá
precisam ser copiadas para cá (e vice-versa) — não há sincronização automática.

## Deploy

- Site: projeto Vercel `guia-ortopedia` → https://guia-ortopedia.vercel.app
  (`npx vercel deploy --yes` → `npx vercel promote <url> --yes`).
- App: GitHub Actions (`android.yml`): testes, APK assinado, app no emulador;
  `gh workflow run android.yml -f publish=true --ref main` publica a release e
  grava o APK em `android-releases/` (o site entrega em /app).
