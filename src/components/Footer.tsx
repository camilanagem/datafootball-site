import { useTranslations } from "next-intl";

const SocialIcon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

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
  in: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
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
          <div className="font-serif text-lg font-bold">datafootball<span className="text-[var(--color-tt-red)]">.</span></div>
          <div className="text-xs opacity-60 mt-1">© {year} · {t("footer.rights")}</div>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs uppercase tracking-widest opacity-60">{t("footer.follow")}</span>
          <a href="https://instagram.com/datafootball__" target="_blank" rel="noopener" aria-label="Instagram" className="hover:opacity-70">{ICONS.ig}</a>
          <a href="https://tiktok.com/@datafootball__" target="_blank" rel="noopener" aria-label="TikTok" className="hover:opacity-70">{ICONS.tt}</a>
          <a href="#" target="_blank" rel="noopener" aria-label="LinkedIn" className="hover:opacity-70">{ICONS.in}</a>
        </div>
      </div>
    </footer>
  );
}
