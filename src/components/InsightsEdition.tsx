import { getTranslations } from "next-intl/server";
import { Cover } from "@/components/Cover";

type Post = {
  club: string; flag: string; crest?: string | null; handle: string;
  kind: string; kindLabel: string; type: "engagement" | "likes";
  metric: string; cover_url: string | null; url: string;
};
export type Insights = {
  week: { ini: string; fim: string; label: string };
  manchete: string; insights: string[]; contraste: string; pra_acompanhar: string;
  numeros: { label: string; value: string }[]; posts?: Post[]; legenda: string; assunto: string;
};

// Uma edição de insight renderizada (usada em /insights e /insights/[week]) — ID 2.0.
export async function InsightsEdition({ data }: { data: Insights }) {
  const t = await getTranslations("insights");
  return (
    <>
      <header className="mb-12 border-b border-current/15 pb-8">
        <div className="font-display text-xs uppercase tracking-[0.2em] text-accent mb-3">
          {t("kicker")} · {data.week.label}
        </div>
        <h1 className="font-accent text-4xl md:text-6xl leading-[1.05]">{data.manchete}</h1>
      </header>

      <section className="mb-14">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("whatData")}</h2>
        <ul className="space-y-7">
          {data.insights.map((it, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-display text-2xl text-accent leading-none pt-1 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[17px] md:text-lg leading-relaxed flex-1">{it}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-14 card p-8">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-accent2 mb-4">{t("contrast")}</h2>
        <p className="font-accent text-2xl md:text-3xl leading-snug">{data.contraste}</p>
      </section>

      {data.pra_acompanhar && (
        <section className="mb-16">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] opacity-60 mb-4">{t("watch")}</h2>
          <p className="text-[17px] md:text-lg leading-relaxed opacity-90">{data.pra_acompanhar}</p>
        </section>
      )}

      {data.numeros?.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("numbers")}</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.numeros.map((n, i) => (
              <div key={i} className="card p-5">
                <dt className="font-display text-[11px] uppercase tracking-widest opacity-50 mb-2">{n.label}</dt>
                <dd className="font-display text-xl md:text-2xl leading-tight text-accent tabular-nums">{n.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {data.posts && data.posts.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("posts")}</h2>
          {(["engagement", "likes"] as const).map((typ) => {
            const group = data.posts!.filter((p) => p.type === typ);
            if (group.length === 0) return null;
            return (
              <div key={typ} className="mb-8 last:mb-0">
                <h3 className="font-display text-[11px] uppercase tracking-widest opacity-50 mb-4">
                  {typ === "engagement" ? t("mostEngaged") : t("mostLiked")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {group.map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noopener" className="card group block overflow-hidden hover:opacity-95 transition">
                      <div className="aspect-[4/5] bg-black/5">
                        <Cover src={p.cover_url} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="font-sans font-medium text-sm flex items-center gap-1.5">
                          {p.crest ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.crest} alt="" className="w-4 h-4 object-contain shrink-0" />
                          ) : (
                            <span aria-hidden>{p.flag}</span>
                          )}
                          <span className="truncate">{p.club}</span>
                        </div>
                        <div className="font-display text-[11px] uppercase tracking-wide opacity-50 mt-0.5">{p.kindLabel}</div>
                        <div className="font-display text-base tabular-nums mt-1 text-accent">{p.metric}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
