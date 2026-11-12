# Guia de Ortopedia

O guia para o médico que assume a vaga de ortopedia no SUS e é, ali, o
ortopedista de plantão e de ambulatório. Um site e um app Android, sem conta,
sem banco de dados, todo em português:

- **54 tópicos** em capítulos, cada um na ordem do atendimento: perguntar,
  examinar, alarme, imagem, o que fazer na urgência, procedimentos passo a
  passo, conduta e receita, o retorno, o que vai para a cirurgia pela
  regulação, atestado, fontes.
- **37 procedimentos ilustrados e animados** (SVG com CSS) e, no PDF, quatro
  quadros parados de cada animação.
- **133 imagens de referência** (fotos, radiografias, esquemas) com licença
  livre, autor, licença e página de origem, legendadas em português.
- **Cola do plantão**: 98 textos prontos para o prontuário, a receita, a
  medicação IM, as incidências de raio-X e as notas (46 do caderno do médico,
  52 escritos a partir do guia).
- **Consulta guiada** com nota SOAP, **revisões** com antes/agora/motivo,
  **Super Inteligência** (Gemini) que responde só com o guia e a cola, citando
  a fonte.
- **PDF de estudo** (232 páginas, sumário e índices clicáveis, marcadores).

Texto próprio, escrito a partir das diretrizes citadas em cada tópico; ainda
sem revisão por ortopedista.

| Onde | Link |
| --- | --- |
| Site | https://guia-ortopedia.vercel.app |
| App Android (APK) | https://guia-ortopedia.vercel.app/app |
| PDF | https://guia-ortopedia.vercel.app/pdf/Guia-de-ortopedia.pdf |
| Repositório | https://github.com/crispinekkovendas-blip/guia-ortopedia |

## Documentação

| Arquivo | O quê |
| --- | --- |
| [docs/design.md](docs/design.md) | Para quê, o que é, o que fica de fora, como se liga ao Renova/Shinmed. |
| [docs/conteudo.md](docs/conteudo.md) | O texto do guia: estrutura, tipos, revisões, cola, fontes, a regra do português, como editar. |
| [docs/ilustracoes.md](docs/ilustracoes.md) | As ilustrações animadas dos procedimentos: motor, geração, versão, quadros para o PDF. |
| [docs/imagens.md](docs/imagens.md) | As imagens de referência: curadoria, licenças, legendas em português, colheita no Europe PMC. |
| [docs/ia.md](docs/ia.md) | A Super Inteligência: trechos, busca, citações, limites, variáveis de ambiente. |
| [docs/pdf.md](docs/pdf.md) | O PDF de estudo: gerador, quadros, links internos, como regenerar. |
| [docs/app-android.md](docs/app-android.md) | O app: pacote, ilustrações e imagens no aparelho, cola, Perguntar, CI, publicação, diagnóstico no emulador. |
| [docs/deploy.md](docs/deploy.md) | Publicar o site e o app; variáveis; rollback; a lista de conferência. |
| [android/README.md](android/README.md) | O app Android visto de dentro (Kotlin + Compose). |
| [CLAUDE.md](CLAUDE.md) | As regras deste repositório para sessões com o Claude. |

## Pastas

| Onde | O quê |
| --- | --- |
| `src/lib/ortho-guide/` | O texto do guia (`data*.ts`), tipos, consulta guiada, revisões, cola, trechos para a IA. |
| `src/lib/images.json` + `public/imagens/` | As imagens de referência, geradas por `npm run images` a partir da pasta curada (fora do repo). |
| `scripts/images/titulos-pt.json` | A legenda em português de cada imagem, pelo título original. |
| `scripts/ortho-guide/sprites/` → `public/ortho/procedures/` | As ilustrações animadas (`npm run sprites`) e os quadros para o PDF (`frames.mjs`). |
| `src/lib/guide-*.ts`, `gemini.ts` | A Super Inteligência (servidor). |
| `src/lib/app-bundle.ts` → `/api/app/guia` | O pacote que o app Android baixa. |
| `android/` | O app (Kotlin + Compose). `npm run app:fixtures` gera o pacote e as respostas do motor do site para os testes. |
| `android-releases/` | Os APKs que o site entrega em `/app` (o GitHub Actions grava ao publicar; 3 mais novos). |
| `public/pdf/` | O PDF de estudo (gerado fora do repo, ver docs/pdf.md). |
| `.github/workflows/` | `android.yml` (testes, APK, emulador, publicação) e `imagens-epmc.yml` (colheita de figuras). |

## Rodar

```
npm ci
npm run images      # precisa da pasta de referências curada (ver docs/imagens.md)
npm run sprites     # as ilustrações animadas
npm test            # 24 testes (guia, cola, consulta, revisões, releases, IA)
npm run dev
```

App: `npm run app:fixtures` e, em `android/`, `gradlew testDebugUnitTest assembleDebug`.
A Super Inteligência só liga com `GEMINI_API_KEY` no ambiente.

## Publicar

Site: `npx vercel deploy --yes` → `npx vercel inspect <url> --wait` → `npx vercel promote <url> --yes`.
App: `gh workflow run android.yml -f publish=true --ref main` — a release sai no
GitHub e o APK entra em `android-releases/`; depois, `git pull --rebase` e um
deploy novo do site. Detalhes e armadilhas em [docs/deploy.md](docs/deploy.md).
