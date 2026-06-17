"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type State = "idle" | "loading" | "success" | "error";
const KEY = "df_news_v1"; // localStorage: visitante já viu/assinou -> não mostra de novo

export function NewsletterPopup() {
  const t = useTranslations("newsletter");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return; // já dispensou/assinou

    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      setOpen(true);
      cleanup();
    };
    const onScroll = () => {
      const sc = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      if (sc > 0.45) trigger();
    };
    const timer = setTimeout(trigger, 18000);
    window.addEventListener("scroll", onScroll, { passive: true });
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState("success");
        try {
          localStorage.setItem(KEY, "1");
        } catch {}
        setTimeout(() => setOpen(false), 2200);
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-[var(--background)] text-[var(--foreground)] border border-current/20 p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label={t("close")}
          className="absolute top-3 right-4 text-2xl leading-none opacity-50 hover:opacity-100"
        >
          ×
        </button>

        <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">{t("kicker")}</p>
        <h2 className="font-serif text-2xl md:text-3xl leading-tight mb-3">{t("title")}</h2>
        <p className="text-sm opacity-70 mb-6">{t("subtitle")}</p>

        {state === "success" ? (
          <p className="text-sm font-sans border border-current/30 px-4 py-3">{t("success")}</p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              aria-label={t("placeholder")}
              disabled={state === "loading"}
              className="bg-transparent border border-current/30 px-4 py-3 text-sm font-sans outline-none focus:border-current placeholder:opacity-40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="font-sans text-sm uppercase tracking-widest px-6 py-3 bg-current text-[var(--background)] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {state === "loading" ? t("loading") : t("cta")}
            </button>
            {state === "error" && <p className="text-xs text-tt-red font-sans">{t("error")}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
