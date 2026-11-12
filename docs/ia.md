# A Super Inteligência

A pergunta em texto livre que responde **só com o guia e a cola**, citando o
trecho. É o motor do Renova sem banco de dados e sem embeddings: a busca é
lexical (`smart-search.ts`) e a memória de respostas vive no processo.

## Arquivos

| Arquivo | O quê |
| --- | --- |
| `src/lib/gemini.ts` | Cliente da API do Gemini (streaming, lista de modelos com fallback por um minuto, `thinkingLevel`). |
| `src/lib/ortho-guide/chunks.ts` | O guia em trechos: por tópico #0 avaliação, #1 urgência, #2 conduta e retorno, #3… um por procedimento. |
| `src/lib/guide-chunks.ts` | Junta os trechos do guia (`orto-<slug>#n`) e da cola (`cola-<id>`), `retrieveChunks(q, limit)` pela busca lexical, `chunkById`, `formatChunk` (`<trecho id="…">`). |
| `src/lib/guide-citations.ts` | Citação `[[id]]` → fonte (nome, tópico, seção) e link: `/guia/<slug>` ou `/cola#<id>`. |
| `src/lib/guide-answer-cache.ts` | `questionKey` (pergunta normalizada), `guideVersion` (hash do conteúdo), `memoryStore()`. |
| `src/lib/guide-ask.ts` | `askGuide()` (gerador de eventos), `SYSTEM`, a ferramenta `buscar_no_guia` (até 3 buscas), `MAX_QUESTION = 600`, `guideAiEnabled()`, `AskScope = "ortopedia"`. |
| `src/app/api/guia/perguntar/route.ts` | `POST` → NDJSON (um evento por linha); sem conta; 30 perguntas por 10 min por endereço; `maxDuration 60`. |
| `src/components/guide/ask-box.tsx`, `guide-ask.tsx` | A caixa em `/guia` e a conversa (mostra a busca, escreve a resposta enquanto chega, fontes clicáveis). |
| `src/lib/guide-ask.test.mjs` | Testes com um Gemini falso: trechos, busca, citações, memória. |

## O fluxo

1. A pergunta chega (`question`, `history` até 6 turnos, `scope`, `context`,
   `fresh`). Se a mesma pergunta já foi respondida nesta versão do guia, volta
   da memória (`cached`).
2. Os trechos mais parecidos são anexados à pergunta; o modelo pode chamar
   `buscar_no_guia` até 3 vezes com outros termos (evento `search`).
3. A resposta sai em `text`; `[[id]]` vira citação numerada; `sources` lista
   os trechos citados; `done` fecha. `error` quando a IA não respondeu
   ("use a busca ou abra o tópico").

O app Android chama a mesma rota (aba Perguntar e o botão em toda tela) e
abre o trecho citado no próprio app.

## Variáveis de ambiente

| Variável | O quê |
| --- | --- |
| `GEMINI_API_KEY` | Obrigatória para ligar a IA (sem ela a caixa some e a rota devolve 503). Está na produção do Vercel; **não** está no ambiente de preview. |
| `GEMINI_MODELS` | Lista de modelos, por ordem (`a,b,c`). |
| `GEMINI_THINKING` | `low` por padrão. |
| `GEMINI_EMBED_MODEL` | Não usado aqui (sem embeddings), herdado do Renova. |

A chave nunca vai ao aparelho nem aparece em código, log ou commit.

## Limites e custo

- 30 perguntas por 10 minutos por endereço (`x-forwarded-for`), por instância.
- Memória de respostas por instância (some a cada deploy).
- Pergunta de 3 a 600 caracteres.
