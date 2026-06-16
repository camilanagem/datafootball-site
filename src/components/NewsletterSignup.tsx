"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type State = "idle" | "loading" | "success" | "error";

export function NewsletterSignup() {
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
    <section className="border-t border-current/15">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
            {t("kicker")}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl leading-tight mb-3">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base opacity-70 mb-6 max-w-md">
            {t("subtitle")}
          </p>

          {state === "success" ? (
            <p className="text-sm font-sans border border-current/30 px-4 py-3 inline-block">
              {t("success")}
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
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

          {state === "error" && (
            <p className="text-xs text-tt-red mt-3 font-sans">{t("error")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
