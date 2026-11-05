import Link from "next/link";
import { ORTHO_CREDIT, orthoDocs, orthoStats } from "@/lib/ortho-guide";
import { imageStats } from "@/lib/images";
import { OrthoIndex } from "@/components/guide/ortho-index";
import { OrthoCredit } from "@/components/guide/ortho-credit";

export const metadata = { title: "Guia" };

/** O guia de ortopedia — plantão e ambulatório — para o médico que assume a vaga de ortopedia no SUS e é, ali, o ortopedista. */
export default function GuiaPage() {
  const stats = orthoStats();
  const images = imageStats();
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-4 sm:mb-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-pine-950 sm:text-[28px]">Guia de Ortopedia</h1>
          <Link href="/guia/revisoes" className="chip bg-amber-100 text-amber-900 hover:bg-amber-200">
            Revisão {ORTHO_CREDIT.revision} · {ORTHO_CREDIT.revisedAt} · ver mudanças →
          </Link>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-pine-900/60">
          Você é o ortopedista de plantão e de ambulatório: {stats.topics} tópicos em {stats.chapters} capítulos, cada um na ordem do atendimento — perguntar, examinar (
          {stats.exams} manobras), alarme, imagem, o que fazer na urgência, procedimentos passo a passo (37, ilustrados e animados), conduta, receita, o retorno, o que
          vai para a cirurgia pela regulação, e atestado. {images.images} imagens de referência com licença livre em{" "}
          <Link href="/imagens" className="font-bold text-pine-600 hover:underline">
            Imagens
          </Link>
          ; o{" "}
          <Link href="/app" className="font-bold text-pine-600 hover:underline">
            app Android
          </Link>{" "}
          leva tudo sem internet.
        </p>
      </header>
      <OrthoIndex docs={orthoDocs()} />
      <div className="mt-8">
        <OrthoCredit />
      </div>
    </div>
  );
}
