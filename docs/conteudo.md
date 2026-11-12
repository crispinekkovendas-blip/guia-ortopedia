# O conteúdo do guia

Tudo o que o médico lê vem de `src/lib/ortho-guide/`. Não há banco: os
arquivos TypeScript são a fonte, e o site, o app e o PDF leem dali.

## Estrutura

| Arquivo | O quê |
| --- | --- |
| `types.ts` | `OrthoChapter` › `OrthoTopic` › `OrthoExam`, `OrthoProcedure`, `OrthoRx`. |
| `data.ts` | Os capítulos e tópicos principais (bases, coluna, ombro, cotovelo, mão, quadril, joelho, tornozelo e pé, gota…), `ORTHO_CREDIT`, `FIRST_DAY`. |
| `data-bases.ts`, `data-urgencias.ts`, `data-crianca.ts`, `data-mao.ts` | Capítulos separados por tamanho (bases do plantão, urgências, criança, mão). |
| `rx-base.ts` | Receitas-base reutilizadas pelos tópicos. |
| `index.ts` | `ORTHO_GUIDE`, `ORTHO_CREDIT`, `SPRITES_VERSION`, `orthoDocs()`, `findOrthoTopic()`, `orthoStats()`, `procedureImage()`. |
| `consult.ts` | A consulta guiada: regiões, alarmes universais e por região, o roteiro e a nota SOAP. |
| `revisions.ts`, `revisions-rev3.ts` | As revisões: cada mudança com antes, agora e motivo. |
| `cola.ts`, `cola-mais.ts` | A cola do plantão (ver abaixo). |
| `chunks.ts` | Os trechos para a Super Inteligência (ver `ia.md`). |
| `*.test.mjs` | Os testes (`npm test`). |

Um tópico (`OrthoTopic`) tem, na ordem em que aparece: `slug`, `title`,
`aliases` (como o paciente fala — aparecem no site e no app como "Também:"),
`summary`, `ask` (o que perguntar), `exam` (manobras com `name`, `how`,
`positive`), `alarm`, `imaging`, `urgent` (o que o ortopedista de plantão faz
hoje), `procedures` (passo a passo: `name`, `needs`, `steps`, `after`, `when`,
`immobilize`…), `plan`, `rx` (receita), `followup` (retorno), `surgery`
(o que vai para a cirurgia pela regulação), `leave` (atestado), `pearls`,
`sources`.

O número de um procedimento no guia (1…37) é a ordem em que aparece
percorrendo `ORTHO_GUIDE`; `k` é a posição dentro do tópico. Ilustração e
imagens usam `<slug>-<k>`.

## Revisões

Toda mudança de conteúdo clínico entra em `ORTHO_CHANGES` com `slug`,
`section`, `before`, `after` e `why`, numa revisão (`ORTHO_REVISIONS`,
hoje a 3ª, 2026-10-28). A página `/guia/revisoes` e o app mostram isso ao
médico, que marca Concordo/Discordo (guardado no aparelho). O guia sempre
mostra o texto novo; o antigo só existe na revisão. Mudança de forma (uma
tradução, uma vírgula) não precisa de revisão; mudança do que fazer precisa.

## Cola do plantão

- `cola.ts` — `CADERNO`: 46 textos transcritos do dontpad ISORTOP do médico
  (2026-11-05), em caixa alta como ele escreve no prontuário, com lacunas
  `______` para o que é do paciente. **Não reescrever**; só tirar o que era
  de um paciente específico.
- `cola-mais.ts` — `COLA_MAIS`: 52 textos escritos do mesmo jeito a partir do
  guia, para cobrir os 54 tópicos; `source: "guia"` (etiqueta "do guia").
- `COLA = [...CADERNO, ...COLA_MAIS]`; grupos `prontuario`, `receita`, `im`,
  `notas`, `raio-x`; `colaForTopic(slug)` e `colaByGroup()`.
- Site: `/cola` e a seção do tópico (`cola-card.tsx`, copiar com um toque).
  App: `ColaScreen` e o card do tópico. PDF: apêndice C.

## Fontes (bibliografia)

Cada tópico lista `sources`: entidade e código (NICE NG59, BOAST, AAOS…),
título em português, ano quando há. Entidade, código e ano identificam o
original; não traduzir códigos.

## A regra do português

Tudo em português do Brasil. Termos consagrados em inglês ficam entre
parênteses, uma vez, depois do nome em português, e só quando são o nome do
teste ou da manobra: "Braço caído (drop arm)", "Compressão da perna
(squeeze)", "pinça (mortise)". Siglas de mnemônicos ("PRICE") vêm com a
explicação. Sinônimos de busca em inglês foram trocados por como o paciente
fala. Eponímias (Lachman, McMurray, Thessaly, Ottawa, Elson) ficam.

## Como editar

1. Mude o texto em `data*.ts` (ou a cola em `cola-mais.ts`).
2. Mudança clínica: registre em `revisions-rev3.ts` (ou abra a 4ª revisão).
3. `npm test` — os testes conferem ids únicos, slugs, cobertura da cola,
   revisões apontando para tópicos existentes, a consulta guiada.
4. `npm run app:fixtures` e, em `android/`, `gradlew testDebugUnitTest` — o
   motor de busca em Kotlin é comparado ao do site em 40 consultas.
5. PDF: `node C:/Users/admin/XGLA/Software/MEDAPP/ortho-pdf.mjs` (ver `pdf.md`).
6. Commit, push; deploy quando o usuário mandar (ver `deploy.md`). O app
   recebe o texto novo pelo pacote, sem APK novo.

## Divergência com o Renova/Shinmed

O texto foi copiado do RenovaAPP em 2026-11-05 e já divergiu: as traduções
(termos, fontes, legendas) só existem aqui. Quem alterar conteúdo clínico em
um dos lados deve copiar para o outro à mão.
