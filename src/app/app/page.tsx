import { headers } from "next/headers";
import { apkReleases } from "@/lib/app-releases";
import { qrSvg } from "@/lib/qr-svg";

export const metadata = { title: "App Android" };
export const dynamic = "force-dynamic";

function mb(size: number): string {
  return `${(size / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/** O app Android: o APK mais novo, o QR para baixar no celular e como instalar. */
export default async function AppPage() {
  const releases = apkReleases();
  const latest = releases[0] ?? null;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "guia-ortopedia.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const url = latest ? `${proto}://${host}/api/app/apk/${latest.fileName}` : null;
  const qr = url ? await qrSvg(url, 200) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-pine-950 sm:text-[28px]">App Android</h1>
        <p className="mt-1 max-w-2xl text-sm text-pine-900/60">
          O guia inteiro no celular, sem internet: os 54 tópicos, a consulta guiada com a nota SOAP, os 37 procedimentos animados e as imagens de referência. Sem
          conta: instale e abra. O app baixa o guia uma vez e confere se mudou cada vez que abre.
        </p>
      </header>

      {latest && url ? (
        <div className="card flex flex-wrap items-start gap-6 p-4 sm:p-6">
          {qr ? <div className="shrink-0 rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} /> : null}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-pine-900/60">Versão mais nova</p>
            <p className="text-xl font-extrabold text-pine-950">
              {latest.version} <span className="text-sm font-semibold text-pine-900/50">· {mb(latest.size)}</span>
            </p>
            <a href={url} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-pine-950 px-5 text-[14px] font-bold text-white hover:bg-pine-900">
              Baixar o APK
            </a>
            <ol className="mt-4 list-decimal space-y-1 pl-5 text-[13.5px] text-pine-900/80">
              <li>No celular, aponte a câmera para o QR (ou abra esta página) e toque em Baixar.</li>
              <li>Abra o arquivo baixado. O Android pergunta se permite instalar deste site: permita.</li>
              <li>Abra o Guia de Ortopedia. Na primeira vez ele baixa o guia e as imagens; depois funciona sem internet.</li>
            </ol>
            <p className="mt-3 text-[12px] text-pine-900/50">Android 8 ou mais novo. Versão nova instala por cima da antiga, sem perder favoritos.</p>
            {releases.length > 1 ? (
              <p className="mt-2 text-[12px] text-pine-900/50">
                Anteriores:{" "}
                {releases.slice(1).map((r) => (
                  <a key={r.fileName} href={`/api/app/apk/${r.fileName}`} className="mr-2 underline">
                    {r.version}
                  </a>
                ))}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="card p-4 text-sm text-pine-900/60">O primeiro APK ainda está sendo publicado. Volte em alguns minutos.</p>
      )}
    </div>
  );
}
