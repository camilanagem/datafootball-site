import type { Post } from "@/lib/data";
import { Cover } from "./Cover";

const ExternalLink = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6"/>
    <path d="M10 14 21 3"/>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  </svg>
);

function fmt(n: number | null | undefined): string {
  if (n == null) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const ORDINALS: Record<string, string[]> = {
  pt: ["", "Primeiro", "Segundo", "Terceiro", "Quarto", "Quinto", "Sexto", "Sétimo", "Oitavo", "Nono", "Décimo"],
  es: ["", "Primero", "Segundo", "Tercero", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo"],
  en: ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"],
};

function ordinal(n: number, locale: string): string {
  return ORDINALS[locale]?.[n] ?? ORDINALS.en[n] ?? `${n}th`;
}

export function PostCard({
  post,
  kind,
  locale = "en",
  pct,
}: {
  post: Post;
  kind?: string;
  accent?: "default" | "tt-red" | "tt-sage";
  locale?: string;
  pct?: number;
}) {
  // ID 2.0 — cor por categoria (igual aos cards do produto): photos verde · reels azul · tiktok vermelho
  const KIND: Record<string, { text: string; bg: string }> = {
    photos: { text: "text-accent", bg: "bg-accent" },
    reels: { text: "text-accent2", bg: "bg-accent2" },
    tiktok: { text: "text-tt-red", bg: "bg-tt-red" },
  };
  const kc = KIND[kind ?? ""] ?? KIND.photos;

  const ex = post.extra;
  const metrics = ex ? [
    ex.likes    != null ? { label: "Likes",  value: fmt(ex.likes)    } : null,
    ex.comments != null ? { label: "Cmts",   value: fmt(ex.comments) } : null,
    ex.views    != null ? { label: "Views",  value: fmt(ex.views)    } : null,
    ex.shares   != null ? { label: "Shares", value: fmt(ex.shares)   } : null,
  ].filter(Boolean) as { label: string; value: string }[] : [];

  const posLabel = ordinal(post.posicao, locale);

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener"
      className="card group block overflow-hidden hover:opacity-95 transition"
    >
      <div className="relative aspect-[4/3] bg-current/5">
        <Cover src={post.cover_url} className="w-full h-full object-cover" />
        <span className="absolute top-3 right-3 opacity-40 group-hover:opacity-100 transition">
          <ExternalLink size={16} />
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 font-display text-xs uppercase tracking-widest opacity-60">
            <span>{post.flag}</span>
            <span>{post.liga}</span>
          </div>
          <div className="text-right shrink-0">
            <span className={`font-display text-3xl leading-none block ${kc.text}`}>
              {String(post.posicao).padStart(2, "0")}
            </span>
            <span className="font-display text-[10px] uppercase tracking-widest opacity-60 block">
              {posLabel}
            </span>
          </div>
        </div>
        <div className="font-sans text-lg md:text-xl font-medium leading-tight mb-3">{post.club}</div>
        <p className="text-sm opacity-80 line-clamp-2 mb-3">{post.caption_clean}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none">{post.metric_value}</span>
          <span className="font-display text-xs uppercase tracking-widest opacity-60">{post.metric_label}</span>
        </div>
        {/* a barra — preenchida na cor da categoria, como o card do produto */}
        <div className="mt-3 h-2 rounded-full bg-current/10 overflow-hidden">
          <div className={`h-full rounded-full ${kc.bg}`} style={{ width: `${Math.max(6, Math.min(100, (pct ?? 1) * 100))}%` }} />
        </div>

        {metrics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current/10 flex gap-4">
            {metrics.map(m => (
              <div key={m.label}>
                <div className="font-display text-[10px] uppercase tracking-wider opacity-60">{m.label}</div>
                <div className="text-sm font-medium tabular-nums">{m.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
