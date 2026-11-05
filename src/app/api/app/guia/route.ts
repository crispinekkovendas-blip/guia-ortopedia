import { appBundle } from "@/lib/app-bundle";

/**
 * O guia inteiro para o app Android (app-bundle.ts). Sem conta: o guia é
 * público. Com `If-None-Match` igual à versão do aparelho, responde 304 sem
 * corpo — a sincronização de todo dia não baixa nada.
 */
export async function GET(request: Request) {
  const { bundle, json } = appBundle();
  const etag = `"${bundle.version}"`;
  const headers = { etag, "cache-control": "public, max-age=300, must-revalidate" };
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  return new Response(json, { headers: { ...headers, "content-type": "application/json; charset=utf-8" } });
}
