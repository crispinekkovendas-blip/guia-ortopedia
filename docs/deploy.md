# Publicar

Produção só quando o usuário mandar. Commit e push podem ir antes.

## Site (Vercel, projeto `guia-ortopedia`)

```
npx vercel deploy --yes                       # preview; anote a URL
npx vercel inspect <url> --wait --timeout 8m  # até "Ready"
npx vercel promote <url> --yes                # cria um deployment novo de produção
npx vercel inspect dpl_<id> --wait            # o id vem na resposta do promote
```

A propagação em https://guia-ortopedia.vercel.app leva 30–60 s. Conferir:

- `/guia` abre e a caixa Perguntar aparece (a chave do Gemini está na produção);
- um tópico com imagens mostra legendas em português e as fontes;
- `/app` lista o APK mais novo e `/api/app/apk/<arquivo>` responde 200;
- `/pdf/Guia-de-ortopedia.pdf` baixa;
- `/api/app/guia` devolve o pacote com a versão nova.

**Rollback**: `npx vercel promote <url-do-deployment-anterior> --yes`
(`npx vercel ls --prod` lista os anteriores).

## Configuração que não pode sumir

- `vercel.json`: `{"framework":"nextjs"}`. O projeto foi criado pela CLI
  como "Other" e tudo dava 404 sem isso.
- `next.config.ts` → `outputFileTracingIncludes`: `"/api/app/apk/**"` e
  `"/app"` apontando para `android-releases/`, senão a função não encontra
  os APKs. A chave é lida como glob (nada de `[file]`).
- Variáveis de ambiente (produção): `GEMINI_API_KEY` (obrigatória para a IA;
  falta no preview), `GEMINI_MODELS`/`GEMINI_THINKING` opcionais,
  `NEXT_PUBLIC_SITE_URL` para o QR e os links absolutos.

## App Android

Ver `app-android.md` › "Publicar uma versão". Resumo: `gh workflow run
android.yml -f publish=true --ref main` → esperar → `git pull --rebase` →
deploy e promote do site.

## Lista de conferência de uma rodada

1. `npm test`; `npx tsc --noEmit`; `npm run app:fixtures` + testes do app
   quando mudou texto, cola, imagens ou busca.
2. Imagens novas: legenda em `scripts/images/titulos-pt.json`, `npm run images`.
3. Ilustração nova: `npm run sprites`, `frames.mjs`, subir `SPRITES_VERSION`.
4. Texto mudou: regenerar o PDF (`MEDAPP/ortho-pdf.mjs`) e commitar a cópia.
5. Commit (autor Gersinho, trailers da sessão), push.
6. Código Kotlin mudou: publicar o APK (CI) e puxar o commit.
7. Deploy, inspect, promote; conferir a lista acima.
8. Anotar na nota do vault (`Business/Medapp/Guia de Ortopedia (produto).md`)
   o que foi publicado e o id de produção, com o anterior para rollback.
