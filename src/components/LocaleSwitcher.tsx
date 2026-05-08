"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "es", label: "ES" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  return (
    <div className="inline-flex items-center gap-1 text-xs font-sans tracking-wider">
      {LOCALES.map((l, i) => (
        <span key={l.code} className="inline-flex items-center">
          <button
            onClick={() =>
              startTransition(() => {
                router.replace(pathname, { locale: l.code });
              })
            }
            className={
              "transition-opacity " +
              (l.code === locale ? "opacity-100 font-bold" : "opacity-50 hover:opacity-100")
            }
          >
            {l.label}
          </button>
          {i < LOCALES.length - 1 && <span className="mx-1 opacity-30">·</span>}
        </span>
      ))}
    </div>
  );
}
