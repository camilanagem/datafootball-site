import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getEdition } from "@/lib/edition";

export function Header() {
  const t = useTranslations("nav");
  const { isTournament } = getEdition();
  return (
    <header className="border-b border-current/15">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" aria-label="DATA FOOTBALL — home" className="inline-flex items-center">
          {/* logo real — preta no tema claro, branca no escuro */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-line-black.png" alt="DATA FOOTBALL" className="block dark:hidden h-6 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-line-white.png" alt="DATA FOOTBALL" className="hidden dark:block h-6 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-sans tracking-wide">
          <Link href="/" className="hover:opacity-70">{t("home")}</Link>
          {isTournament ? (
            <Link href="/national-teams" className="hover:opacity-70">{t("nationalTeams")}</Link>
          ) : (
            <>
              <Link href="/clubs" className="hover:opacity-70">{t("clubs")}</Link>
              <Link href="/leagues" className="hover:opacity-70">{t("leagues")}</Link>
            </>
          )}
          <Link href="/hall-of-fame" className="hover:opacity-70">{t("halloffame")}</Link>
          <Link href="/methodology" className="hover:opacity-70">{t("methodology")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
