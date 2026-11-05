import type { ProcedureImages } from "@/lib/images";

/**
 * As imagens de referência de um tópico, por procedimento: foto, radiografia
 * ou esquema, cada uma com autor, licença e a página de origem. Abrem no
 * tamanho cheio em outra aba.
 */
export function TopicImages({ groups, compact = false }: { groups: ProcedureImages[]; compact?: boolean }) {
  if (groups.length === 0) return null;
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={`${g.slug}-${g.k}`}>
          {groups.length > 1 || !compact ? <p className="mb-2 text-[13px] font-extrabold text-pine-950">{g.name}</p> : null}
          <ul className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
            {g.images.map((img) => (
              <li key={img.src} className="min-w-0">
                <a href={img.src} target="_blank" rel="noopener" className="block overflow-hidden rounded-xl border border-pine-900/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagem estática do próprio site */}
                  <img src={img.src} alt={img.title} width={img.w} height={img.h} loading="lazy" className="aspect-[4/3] w-full object-contain bg-white" />
                </a>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-pine-900/80" title={img.title}>
                  {img.title}
                </p>
                <p className="text-[10.5px] leading-snug text-pine-900/50">
                  {img.author ? `${img.author} · ` : ""}
                  <a href={img.page} target="_blank" rel="noopener" className="underline decoration-pine-300 hover:text-pine-700">
                    {img.license}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
