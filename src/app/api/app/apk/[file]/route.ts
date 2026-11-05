import { apkFile, apkReleases } from "@/lib/app-releases";

/** Entrega um APK listado em android-releases/releases.json (só os nomes da lista; nada de caminho livre). */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const release = apkReleases().find((r) => r.fileName === file);
  const data = release ? apkFile(release) : null;
  if (!release || !data) return new Response("APK não encontrado.", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "content-type": "application/vnd.android.package-archive",
      "content-disposition": `attachment; filename="${release.fileName}"`,
      "content-length": String(data.length),
      "cache-control": "public, max-age=3600",
    },
  });
}
