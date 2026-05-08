import type { Post } from "@/lib/data";

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

export function PostCard({ post, accent = "default" }: { post: Post; accent?: "default" | "tt-red" | "tt-sage" }) {
  const accentColor =
    accent === "tt-red" ? "var(--color-tt-red)" :
    accent === "tt-sage" ? "var(--color-tt-sage)" :
    "currentColor";

  const ex = post.extra;
  const metrics = ex ? [
    ex.likes    != null ? { label: "Likes",  value: fmt(ex.likes)    } : null,
    ex.comments != null ? { label: "Cmts",   value: fmt(ex.comments) } : null,
    ex.views    != null ? { label: "Views",  value: fmt(ex.views)    } : null,
    ex.shares   != null ? { label: "Shares", value: fmt(ex.shares)   } : null,
  ].filter(Boolean) as { label: string; value: string }[] : [];

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener"
      className="group block rounded-xl border border-current/15 overflow-hidden hover:border-current/40 transition-all"
    >
      {/* cover image */}
      {post.cover_url ? (
        <div className="relative aspect-[4/3] bg-current/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <span className="font-serif text-3xl leading-none text-white" style={{ color: accentColor }}>
              {String(post.posicao).padStart(2, "0")}
            </span>
            <span className="text-white/50 group-hover:text-white transition">
              <ExternalLink size={16} />
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 p-4 pb-0">
          <span className="font-serif text-3xl leading-none" style={{ color: accentColor }}>
            {String(post.posicao).padStart(2, "0")}
          </span>
          <span className="opacity-30 group-hover:opacity-100 transition"><ExternalLink /></span>
        </div>
      )}

      {/* card body */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 mb-1">
          <span>{post.flag}</span>
          <span>@{post.handle}</span>
        </div>
        <div className="font-serif text-lg leading-tight mb-3">{post.club}</div>
        <p className="text-sm opacity-80 line-clamp-2 mb-3">{post.caption_clean}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-2xl">{post.metric_value}</span>
          <span className="text-xs uppercase tracking-widest opacity-60">{post.metric_label}</span>
        </div>

        {metrics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current/10 flex gap-4">
            {metrics.map(m => (
              <div key={m.label}>
                <div className="text-[10px] uppercase tracking-wider opacity-40">{m.label}</div>
                <div className="text-sm font-medium">{m.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
