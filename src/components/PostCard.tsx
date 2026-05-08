import type { Post } from "@/lib/data";

const ExternalLink = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6"/>
    <path d="M10 14 21 3"/>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  </svg>
);

export function PostCard({ post, accent = "default" }: { post: Post; accent?: "default" | "tt-red" | "tt-sage" }) {
  const accentColor =
    accent === "tt-red" ? "var(--color-tt-red)" :
    accent === "tt-sage" ? "var(--color-tt-sage)" :
    "currentColor";

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener"
      className="group block rounded-xl border border-current/15 p-4 hover:border-current/40 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className="font-serif text-3xl leading-none"
          style={{ color: accentColor }}
        >
          {String(post.posicao).padStart(2, "0")}
        </span>
        <span className="opacity-30 group-hover:opacity-100 transition"><ExternalLink /></span>
      </div>
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
    </a>
  );
}
