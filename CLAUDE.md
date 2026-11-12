# Regras deste repositório

Leia `README.md` e a pasta `docs/` antes de mexer. O resumo do que importa:

## Regras duras

- **Português do Brasil em tudo que o médico vê**: texto do guia, cola, legendas
  das imagens, fontes (bibliografia), sinônimos de busca, telas do site e do
  app, PDF. Nome de teste ou manobra em inglês só entre parênteses, uma vez,
  depois do nome em português (ex.: "Braço caído (drop arm)"). Imagem nova →
  legenda em `scripts/images/titulos-pt.json` (o build avisa se faltar).
- **Deploy só quando o usuário mandar** ("deploy", ou uma autorização dada de
  antemão para aquela rodada). Commit e push podem ir; produção não.
- **Nunca** publicar conteúdo licenciado do Renova/Shinmed (Plantão, Receitas
  prontas, Drive, `vectors.json`). Este repositório é público.
- **Nada de agentes paralelos** (ferramenta Agent) sem o usuário pedir.
- Commits com autor `Gersinho <269580965+crispinekkovendas-blip@users.noreply.github.com>`
  e os trailers `Co-Authored-By` / `Claude-Session` da sessão.
- A chave do Gemini nunca aparece em código, log, commit ou mensagem.

## Como o conteúdo muda

- Texto do guia: edite `src/lib/ortho-guide/data*.ts` e registre a mudança em
  `revisions.ts` / `revisions-rev3.ts` (antes, agora, motivo) quando for de
  conteúdo clínico — a página Revisões e o app mostram isso ao médico.
- Cola: `cola.ts` (caderno do médico, não reescrever) e `cola-mais.ts` (do guia).
- Imagens: pasta curada fora do repo → `npm run images`. Ilustrações:
  `npm run sprites` (+ `frames.mjs` para o PDF). PDF: `MEDAPP/ortho-pdf.mjs`.
- Depois de mudar texto, cola ou imagens: `npm test`, `npm run app:fixtures`
  e os testes do app (`gradlew testDebugUnitTest`) — o motor de busca em Kotlin
  é conferido contra o do site.
- O app não precisa de APK novo para mudança de texto: o pacote de
  `/api/app/guia` muda de versão e o app baixa. APK novo só quando o código
  Kotlin muda.

## Armadilhas conhecidas

- `vercel.json` com `{"framework":"nextjs"}` é obrigatório (sem ele tudo dá 404).
- `next.config.ts` → `outputFileTracingIncludes` com `"/api/app/apk/**"`: a
  chave é lida como glob; `[file]` entre colchetes não funciona.
- Um push em `main` dispara `android.yml`; o grupo de concorrência cancela a
  execução mais antiga. Para publicar o APK, cancele a execução do push ou
  dispare o `workflow_dispatch` depois que ela terminar.
- O emulador local existe (`Medium_Phone_API_36.1`) mas emulador + Gradle não
  cabem na memória deste PC: diagnostique o app pelo CI (fotos, `99-falha.png`,
  `logcat-teste.txt`).
- Este PC tem animações do Windows desligadas: o Chrome headless honra
  `prefers-reduced-motion` e as animações parecem paradas aqui; os scripts de
  prévia e de quadros retiram essa regra.
- O texto do guia é uma cópia do RenovaAPP (2026-11-05) e já divergiu (as
  traduções de 2026-11-05 só estão aqui). Não há sincronização automática.
