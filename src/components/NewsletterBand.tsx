"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type State = "idle" | "loading" | "success" | "error";

export function NewsletterBand() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

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
      setState(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="border border-current/20 px-6 py-8 md:px-10 md:py-9 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
      <div className="md:flex-1">
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-2">{t("kicker")}</p>
        <h3 className="font-serif text-xl md:text-2xl leading-snug">{t("barTitle")}</h3>
      </div>
      {state === "success" ? (
        <p className="text-sm font-sans border border-current/30 px-4 py-3 md:whitespace-nowrap">{t("success")}</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 md:w-[420px]">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            disabled={state === "loading"}
            className="flex-1 bg-transparent border border-current/30 px-4 py-3 text-sm font-sans outline-none focus:border-current placeholder:opacity-40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="font-sans text-sm uppercase tracking-widest px-6 py-3 bg-current text-[var(--background)] hover:opacity-80 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {state === "loading" ? t("loading") : t("cta")}
          </button>
        </form>
      )}
    </section>
  );
}
