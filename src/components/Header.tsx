import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Sparkle } from "./Sparkle";

export function Header() {
  const t = useTranslations("nav");
  return (
    <header className="border-b border-current/15">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-3xl uppercase leading-none inline-flex items-center gap-1.5"
        >
          datafootball
          <Sparkle className="w-4 h-4" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-sans tracking-wide">
          <Link href="/" className="hover:opacity-70">{t("home")}</Link>
          <Link href="/clubs" className="hover:opacity-70">{t("clubs")}</Link>
          <Link href="/leagues" className="hover:opacity-70">{t("leagues")}</Link>
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
