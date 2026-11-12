# Guia de Ortopedia — app Android

O Guia de Ortopedia como app nativo em Kotlin + Jetpack Compose, em duas
abas: **Ortopedia** (busca, Atender agora, atalhos do primeiro dia, os
capítulos e tópicos, procedimentos ilustrados e animados, imagens de
referência, cola do plantão, consulta guiada com nota SOAP, revisões) e
**Perguntar** (Super Inteligência, também disponível em toda tela com o
contexto da tela). Sem conta. A visão completa, o CI, a publicação e o
diagnóstico estão em [docs/app-android.md](../docs/app-android.md).

## Como funciona

- **Sem login**: `GuideRepository.start()` entra com uma conta pública fixa.
- **Guia sem internet**: `GET /api/app/guia` entrega o guia inteiro num pacote
  (`src/lib/app-bundle.ts`); o app guarda e sincroniza ao abrir (304 quando
  nada mudou). As abas Receitas, Plantão e Drive vêm vazias e ficam escondidas.
- **Ilustrações e imagens**: baixadas uma vez para `filesDir/sprites` depois
  da sincronização; SVG animado num WebView sem JavaScript e sem rede
  (`SpriteView`); toque amplia (`ZoomDialog`, `ZoomableImage`).
  `ortopedia.spritesVersion` mudou → apaga e baixa tudo de novo, sem APK novo.
- **Busca**: porte em Kotlin do motor do site (`search/`); o teste
  `SmartSearchGoldenTest` compara com o site em 40 consultas — mudou a busca
  lá, rode os testes aqui.
- **Cola do plantão**: `ColaScreen` (filtros por grupo, Copiar, Enviar) e o
  card no tópico.
- **Super Inteligência**: pelo servidor (`POST /api/guia/perguntar`); a chave
  do Gemini nunca vai ao aparelho. Citações abrem o trecho no app.
- **Mais**: aviso de revisão nova, favoritos e recentes, pergunta por voz,
  tema escuro (⋮ › Tema escuro), Sobre.

## Build

O GitHub Actions (`.github/workflows/android.yml`) faz tudo a cada push em
`main` que mexe no app, no guia ou nos scripts do app:

1. gera os arquivos de teste a partir do site (`npm run app:fixtures`);
2. roda os testes de unidade e monta o APK assinado (artefato
   `guia-ortopedia-apk`, versão `1.0.<número da execução>`);
3. liga um emulador (Android 14), roda o app de ponta a ponta contra um
   servidor falso (`AppFlowTest.kt`, `ci/emulator-tests.sh`) e publica uma
   foto de cada tela (artefato `fotos-do-emulador`).

Publicar o APK como release: `gh workflow run android.yml -f publish=true
--ref main` (ou Actions › "Android — Guia de Ortopedia" › Run workflow ›
marcar "Publicar o APK"). O APK entra em `android-releases/` e o site o
entrega em `/app` no próximo deploy.

Na máquina, na raiz do repositório:

```
npm run app:fixtures          # só para os testes
cd android && ./gradlew testDebugUnitTest assembleDebug
```

(No Windows deste projeto: `JAVA_HOME` do Android Studio e `ANDROID_HOME`
em `%LOCALAPPDATA%\Android\Sdk`; o teste de emulador só no CI.)

## Assinatura

A chave fica fora do repositório: `~/.renova-android/renova-guia.jks` (senha
no LEIA-ME.txt da mesma pasta) e nos segredos do GitHub `ANDROID_KEYSTORE_*`.
**Guarde uma cópia** — sem ela, uma versão nova não instala por cima da antiga.

O servidor que o app usa é `BuildConfig.API_BASE_URL`
(https://guia-ortopedia.vercel.app); os testes trocam por `ServerConfig.baseUrl`.
