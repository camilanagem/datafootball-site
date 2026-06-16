import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { getEdition } from "@/lib/edition";

export function Header() {
  const t = useTranslations("nav");
  const { isTournament } = getEdition();

  const navItems = [
    { href: "/", label: t("home") },
    ...(isTournament
      ? [{ href: "/national-teams", label: t("nationalTeams") }]
      : [
          { href: "/clubs", label: t("clubs") },
          { href: "/leagues", label: t("leagues") },
        ]),
    { href: "/standings", label: t("standings") },
    { href: "/insights", label: t("insights") },
    { href: "/hall-of-fame", label: t("halloffame") },
    { href: "/methodology", label: t("methodology") },
    { href: "/about", label: t("about") },
  ];
  const mobileItems = navItems;

  return (
    <header className="border-b border-current/15 relative">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" aria-label="DATA FOOTBALL — home" className="inline-flex items-center">
          {/* logo real — preta no tema claro, branca no escuro */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-line-black.png" alt="DATA FOOTBALL" className="block dark:hidden h-6 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-line-white.png" alt="DATA FOOTBALL" className="hidden dark:block h-6 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-sans tracking-wide">
          {navItems.map((it) => (
            <Link key={it.href} href={it.href} className="hover:opacity-70">{it.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileNav items={mobileItems} />
        </div>
      </div>
    </header>
  );
}
