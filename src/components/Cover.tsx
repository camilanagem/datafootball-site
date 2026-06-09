"use client";

import { useState } from "react";

// Mostra a capa do post; se a URL falhar (CDN do IG/TikTok expira), some e
// deixa o placeholder do container aparecer — em vez de uma imagem quebrada.
export function Cover({ src, className = "" }: { src?: string | null; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} loading="lazy" onError={() => setOk(false)} />
  );
}
