import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ICONS = {
  ig: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  ),
  tt: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7.917v4.034A9.948 9.948 0 0 1 16 10.5v6a5.5 5.5 0 1 1-7-5.292V13a2.5 2.5 0 1 0 4 2v-12h4a4 4 0 0 0 4 4z"/>
    </svg>
  ),
};

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-current/15 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Link href="/" aria-label="DATA FOOTBALL" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-line-black.png" alt="DATA FOOTBALL" className="block dark:hidden h-5 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-line-white.png" alt="DATA FOOTBALL" className="hidden dark:block h-5 w-auto" />
          </Link>
          <div className="text-xs opacity-60 mt-2">© {year} · {t("footer.rights")}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <nav className="flex items-center gap-5 text-sm font-sans">
            <Link href="/about" className="hover:opacity-70">{t("nav.about")}</Link>
            <Link href="/methodology" className="hover:opacity-70">{t("nav.methodology")}</Link>
          </nav>
          <div className="flex items-center gap-5">
            <span className="text-xs uppercase tracking-widest opacity-60">{t("footer.follow")}</span>
            <a href="https://instagram.com/datafootball__" target="_blank" rel="noopener" aria-label="Instagram" className="hover:opacity-70">{ICONS.ig}</a>
            <a href="https://tiktok.com/@datafootball__" target="_blank" rel="noopener" aria-label="TikTok" className="hover:opacity-70">{ICONS.tt}</a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <p className="text-[11px] leading-relaxed opacity-40 max-w-3xl">{t("footer.contentRights")}</p>
      </div>
    </footer>
  );
}
