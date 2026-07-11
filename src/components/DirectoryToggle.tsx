import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Toggle Clubs | Teams do diretório (Rankings). Unifica clubes e seleções num só
// lugar — as seleções da Copa continuam acessíveis o ano todo (evergreen), sem aba
// separada que ficaria morta fora do torneio. `current` marca o segmento ativo.
export async function DirectoryToggle({ current }: { current: "clubs" | "teams" }) {
  const t = await getTranslations("nav");
  const seg = [
    { key: "clubs", href: "/clubs", label: t("clubs") },
    { key: "teams", href: "/national-teams", label: t("teams") },
  ] as const;

  return (
    <div className="inline-flex rounded-full border border-current/20 p-1 text-sm font-sans">
      {seg.map((s) => {
        const active = s.key === current;
        return (
          <Link
            key={s.key}
            href={s.href}
            aria-current={active ? "page" : undefined}
            className={
              "px-4 py-1.5 rounded-full transition " +
              (active
                ? "bg-current/90 text-[var(--background)]"
                : "opacity-60 hover:opacity-100")
            }
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
