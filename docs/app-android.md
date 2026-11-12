# O app Android

`br.com.renova.ortopedia` — "Guia de Ortopedia". É o código do Guia Renova
(Kotlin + Jetpack Compose, pasta `android/`) com o que este produto precisa:
abas **Ortopedia** e **Perguntar**, sem login. Servidor:
`BuildConfig.API_BASE_URL = https://guia-ortopedia.vercel.app`.

## Como funciona

- **Sem conta**: `GuideRepository.start()` usa uma conta pública fixa
  (`PUBLIC_ACCOUNT`); não há tela de login. "Sair" apaga o guia e baixa de novo.
- **Guia sem internet**: `GET /api/app/guia` entrega o pacote
  (`src/lib/app-bundle.ts`): o formato do Guia Renova com as abas Receitas,
  Plantão e Drive vazias e `ortopedia` cheia (tópicos com capítulo, revisões,
  índice de busca, ilustrações, imagens, cola, grupos da cola,
  `spritesVersion`). O app guarda o arquivo e sincroniza ao abrir (304 quando
  nada mudou: `If-None-Match` com a versão).
- **Ilustrações e imagens**: depois de cada sincronização o app baixa para
  `filesDir/sprites` os SVGs (`procedures[].image`) e as imagens
  (`images[].src`) que faltam e apaga os que saíram. `spritesVersion` mudou →
  apaga a pasta e baixa tudo. SVG num WebView sem JavaScript e sem rede
  (`SpriteView`), toque → `ZoomDialog`; imagem em `ReferenceImageCard` →
  `ZoomableImage` (pinça e arrasto).
- **Busca**: porte em Kotlin do motor do site; `SmartSearchGoldenTest` compara
  com o site em 40 consultas de ortopedia (`npm run app:fixtures` gera).
- **Cola do plantão**: `ColaScreen` (lista com filtros por grupo, Copiar e
  Enviar) e o card no tópico (`ColaEntry`, `ColaGroup` em `OrthoBundle.kt`).
- **Consulta guiada**: `OrthoConsultScreen` com a nota SOAP para copiar.
- **Perguntar**: `AskScreen` → `POST /api/guia/perguntar` (NDJSON); citações
  abrem o trecho no app; `AssistantFab`/`AssistantSheet` em toda tela com o
  contexto da tela. `ScopeChips` fica escondido (um escopo só).
- **Mais**: aviso de revisão nova (ver mudanças / Depois), menu ⋮ com Sobre e
  tema escuro, favoritos e recentes, pergunta por voz.

## Arquivos que mais mudam

| Arquivo | O quê |
| --- | --- |
| `ui/AppRoot.kt` | As abas (`TABS`), a navegação, o botão da IA, as rotas. |
| `ui/OrthoScreens.kt` | Início da ortopedia (busca, Atender agora, primeiro dia, capítulos, menu), tópico, procedimentos, imagens, zoom. |
| `ui/ColaScreen.kt`, `ui/AskScreen.kt`, `ui/OrthoConsultScreen.kt` | Cola, Perguntar, consulta guiada. |
| `data/GuideRepository.kt` | Sincronização, conta pública, download e limpeza de ilustrações e imagens. |
| `data/OrthoBundle.kt` | O modelo do campo `ortopedia` do pacote. |
| `search/` | O motor de busca em Kotlin. |

## Build e testes

Na máquina:

```
npm run app:fixtures
cd android
JAVA_HOME="C:\Program Files\Android\Android Studio\jbr" ANDROID_HOME="$LOCALAPPDATA\Android\Sdk" \
  sh ./gradlew --no-daemon -q -Dorg.gradle.jvmargs=-Xmx2g testDebugUnitTest compileDebugAndroidTestKotlin
```

O teste de ponta a ponta (`AppFlowTest.kt`) só roda no CI: existe um AVD local
(`Medium_Phone_API_36.1`), mas emulador + Gradle não cabem na memória deste PC.

## CI (`.github/workflows/android.yml`)

Dispara a cada push em `main` que mexe em `android/**`, `src/lib/**`,
`scripts/app/**` ou no próprio workflow, e por `workflow_dispatch` (entrada
`publish`). Três trabalhos:

1. **Testes e APK**: fixtures, testes de unidade, APK assinado (artefato
   `guia-ortopedia-apk`), versão `1.0.<número da execução>`.
2. **App no emulador (Android 14)**: `android/ci/emulator-tests.sh` — o app de
   ponta a ponta contra um servidor falso (`MockWebServer`), uma foto por
   tela; depois instala o APK de release e confere que não fecha. Artefatos
   `fotos-do-emulador` (fotos, `logcat-teste.txt`, `logcat.txt`,
   `99-falha.png` quando falhou) e `relatorio-teste-emulador`.
3. **Publicar o APK** (só com `publish=true`): release
   `android-GuiaOrtopedia-1.0.<n>` e commit do APK em `android-releases/`
   (`scripts/app/add-apk.mjs`, 3 mais novos, `releases.json`).

Concorrência: grupo `android-<ref>` com `cancel-in-progress` — a execução
mais nova cancela a mais antiga. Um push logo antes de `gh workflow run`
cancela (ou é cancelado por) o dispatch: cancele a execução do push
(`gh run cancel <id>`) ou dispare depois que ela terminar.

## Publicar uma versão

```
gh workflow run android.yml -R crispinekkovendas-blip/guia-ortopedia -f publish=true --ref main
gh run watch <id> --exit-status
git pull --rebase origin main        # traz o commit do APK
npx vercel deploy --yes → inspect → promote   # o site passa a entregar o APK novo em /app
```

Confira `https://guia-ortopedia.vercel.app/app` e
`/api/app/apk/GuiaOrtopedia-1.0.<n>.apk` (200). Mudança só de texto não
precisa de APK: o pacote muda de versão e o app baixa.

## Diagnóstico de falha no emulador

Baixe os artefatos (`gh run download <id> -n fotos-do-emulador`): a última
foto diz até onde foi; `99-falha.png` é a tela no momento da falha;
`logcat-teste.txt` tem o log do teste; o relatório HTML tem a linha do
`AppFlowTest.kt`. O passo da aba Perguntar fotografa antes e depois do toque e
aciona a ação de clique do nó se o toque não abriu a aba.

## Assinatura

A chave fica fora do repositório: `~/.renova-android/renova-guia.jks` (a mesma
do Guia Renova; senha no LEIA-ME.txt da pasta) e nos segredos do GitHub
`ANDROID_KEYSTORE_*` deste repositório. **Guarde uma cópia** — sem ela, uma
versão nova não instala por cima da antiga.
