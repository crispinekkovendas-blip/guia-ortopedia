# Guia de Ortopedia — desenho do projeto

Criado em 2026-11-05; esta página reflete o estado em 2026-11-12.

## Para quê

O Guia de ortopedia nasceu dentro do Renova (hoje Shinmed), em Guia clínico ›
Ortopedia, para o médico generalista que assume a vaga de ortopedia no SUS e
é, ali, o ortopedista de plantão e de ambulatório. Este repositório o torna
um produto próprio: um site e um app Android só dele, sem conta, com os
procedimentos ilustrados e animados, as imagens de referência que foi possível
reunir, a cola do plantão e a Super Inteligência.

## O que é

- **Site** (Next.js 15, Tailwind 4, sem banco, sem login): índice com busca
  (`/guia`), tópico na ordem da consulta (`/guia/<slug>`), consulta guiada com
  nota SOAP (`/guia/consulta`), revisões (`/guia/revisoes`), cola do plantão
  (`/cola`), galeria de imagens (`/imagens`), página do app com QR e APK
  (`/app`), PDF em `/pdf/Guia-de-ortopedia.pdf`. Caixa "Perguntar" no índice.
- **App Android** (`br.com.renova.ortopedia`; o código do Guia Renova em
  Kotlin/Compose): abas Ortopedia e Perguntar; abre sem conta, baixa o pacote
  de `/api/app/guia`, guarda e funciona sem internet; baixa as ilustrações e
  as imagens uma vez; cola do plantão; Super Inteligência pelo servidor.
- **Imagens**: 133 fotos, radiografias e esquemas com licença livre
  (Creative Commons de qualquer tipo, inclusive não comercial, CC0, domínio
  público), cada uma com autor, licença, página de origem e legenda em
  português. Curadas fora do repositório (ver `imagens.md`).
- **Ilustrações**: 37 SVGs desenhados em código, animados com CSS (ciclo de
  6 s), mostrados no site, no app (WebView sem JavaScript) e, no PDF, como
  quatro quadros parados.
- **Cola do plantão**: os textos do caderno do médico (dontpad ISORTOP,
  2026-11-05) mais os escritos a partir do guia, cobrindo os 54 tópicos.
- **Super Inteligência**: o motor do Renova sem banco e sem embeddings —
  busca lexical nos trechos do guia e da cola, Gemini responde só com eles e
  cita a fonte; cache em memória; limite por endereço.
- **PDF**: gerado por `MEDAPP/ortho-pdf.mjs` (fora do repo) a partir destes
  dados; sumário, índices, cola e marcadores com links internos.

## Decisões

- **Tudo em português** (2026-11-05): legendas, termos, fontes, sinônimos. O
  nome em inglês de um teste fica entre parênteses uma vez.
- **Licenças não comerciais entram**: o guia não é vendido e o usuário decidiu
  incluir; fontes com todos os direitos reservados continuam de fora.
- **Sem conta**: o guia é público; o app abre direto numa conta pública fixa.
- **Sem Plantão, Receitas prontas e Drive**: conteúdo licenciado do Renova; o
  pacote do app leva essas abas vazias e o app esconde o que não tem.
- **Cola do caderno não é reescrita**: fica em caixa alta como o médico
  escreve; só o que era de um paciente específico foi tirado.
- **Sem revisão por ortopedista** ainda; o aviso fica no site e no PDF.

## O que ficou de fora

- A colheita de figuras do Europe PMC (`scripts/images/epmc.mjs`,
  `imagens-epmc.yml`): o endpoint devolveu 503 por horas e o NCBI caiu na
  mesma janela; o usuário mandou parar. A ferramenta está pronta para retomar.
- "Escutar o paciente" (transcrição contínua) do Guia Renova: a tela existe
  no código do app, mas não há servidor para ela aqui.

## Como se liga ao Renova / Shinmed

O texto do guia (`src/lib/ortho-guide/`), o motor de busca (`smart-search.ts`),
as ilustrações (`scripts/ortho-guide/sprites/`), a IA (`guide-*.ts`,
`gemini.ts`) e o app Android são cópias do RenovaAPP de 2026-11-05. Não há
sincronização: mudanças feitas lá precisam ser copiadas para cá e vice-versa.
As traduções para o português (termos, fontes, legendas) só existem aqui. O
PDF de estudo também é gerado daqui (o gerador vive em `MEDAPP/ortho-pdf.mjs`
e só empresta as dependências do Renova).

## Histórico curto

| Data | O quê |
| --- | --- |
| 2026-11-05 | Repositório, site e app criados; 133 imagens; APK 1.0.2. |
| 2026-11-05 | Cola do plantão (46 → 98 textos); zoom nas ilustrações e imagens; APK 1.0.6 e 1.0.8. |
| 2026-11-05 | PDF com os quadros das animações, sumário e índices clicáveis, marcadores. |
| 2026-11-05 | Super Inteligência no site e no app; APK 1.0.15. |
| 2026-11-05 | Tudo em português (legendas, termos, fontes); PDF regenerado do produto. |
