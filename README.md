# Guia de Ortopedia

O guia para o médico que é o ortopedista de plantão e de ambulatório no SUS:
54 tópicos na ordem da consulta, 37 procedimentos passo a passo ilustrados e
animados, imagens de referência com licença livre, consulta guiada com nota
SOAP e um app Android que funciona sem internet. Texto próprio, escrito a
partir das diretrizes citadas em cada tópico; ainda sem revisão por
ortopedista.

- Site: https://guia-ortopedia.vercel.app
- App Android: https://guia-ortopedia.vercel.app/app

## Pastas

| Onde | O quê |
| --- | --- |
| `src/lib/ortho-guide/` | O texto do guia (dados, tipos, consulta guiada, revisões). |
| `src/lib/images.json` + `public/imagens/` | As imagens de referência, geradas por `npm run images` a partir da pasta curada (ver `docs/design.md`). |
| `scripts/ortho-guide/sprites/` → `public/ortho/procedures/` | As ilustrações animadas (SVG com CSS) dos 37 procedimentos: `npm run sprites`. |
| `src/lib/app-bundle.ts` → `/api/app/guia` | O pacote que o app Android baixa. |
| `android/` | O app (Kotlin + Compose). `npm run app:fixtures` gera o pacote e as respostas do motor do site para os testes. |
| `android-releases/` | Os APKs que o site entrega (o GitHub Actions grava ao publicar). |

## Rodar

```
npm ci
npm run images      # precisa da pasta de referências
npm run sprites
npm test
npm run dev
```

App: `npm run app:fixtures` e, em `android/`, `gradlew testDebugUnitTest assembleDebug`.

## Publicar

Site: `npx vercel deploy --yes` e `npx vercel promote <url> --yes`.
App: `gh workflow run android.yml -f publish=true --ref main` — a release sai no
GitHub e o APK entra em `android-releases/`; depois, `git pull` e um deploy novo.
