import fs from "node:fs";
import path from "node:path";
import { type DayReport, getAvailableDays } from "./data";
import { isNationalTeam, canonicalHandle } from "./edition";
import monitoredList from "../data/monitored_clubs.json";

// 57 clubes monitorados hoje (accounts.yaml). Clube fora daqui (ex.: Villarreal, que só
// aparece no histórico) NÃO entra nas listagens do site. Seleções passam (isNationalTeam).
const MONITORED = new Set((monitoredList as string[]).map((h) => canonicalHandle(h)));
export function isMonitored(handle: string, liga: string): boolean {
  return isNationalTeam(liga) || MONITORED.has(canonicalHandle(handle));
}

const DATA_DIR = path.join(process.cwd(), "src", "data", "days");

let cache: DayReport[] | null = null;

export function getAllReports(): DayReport[] {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) return [];
  cache = getAvailableDays()
    .map((d) => {
      const file = path.join(DATA_DIR, `${d}.json`);
      try {
        return JSON.parse(fs.readFileSync(file, "utf-8")) as DayReport;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as DayReport[];
  return cache;
}

export type ClubAggregate = {
  handle: string;
  club: string;
  flag: string;
  liga: string;
  appearances: number;
  topOnes: number;        // qtd de #1
  // melhores por tipo de conteúdo (engajamento % e maior post em likes)
  byType: {
    photos: { engagement?: number; engagementUrl?: string; likes?: number; likesUrl?: string };
    reels: { engagement?: number; engagementUrl?: string; likes?: number; likesUrl?: string };
    tiktok: { engagement?: number; engagementUrl?: string; likes?: number; likesUrl?: string };
  };
  streak: number;        // dias consecutivos recentes no índice
  bestPost?: { value: string; url: string; cover_url?: string };
  recentAppearances: { date: string; posicao: number; metric: string; url: string; cover_url?: string }[];
};

function fmtLikesCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function aggregateByClub(): Record<string, ClubAggregate> {
  const reports = getAllReports();
  const out: Record<string, ClubAggregate> = {};
  const daysByHandle: Record<string, Set<string>> = {};
  const bestLikesByHandle: Record<string, number> = {};
  const allDays = [...new Set(reports.map((r) => r.date))].sort();

  for (const r of reports) {
    for (const c of r.carousels) {
      for (const p of c.posts) {
        const key = canonicalHandle(p.handle);
        if (!isMonitored(p.handle, p.liga)) continue;   // fora dos 57 monitorados (ex.: Villarreal) → ignora
        if (!out[key]) {
          out[key] = {
            handle: key,
            club: p.club,
            flag: p.flag,
            liga: p.liga,
            appearances: 0,
            topOnes: 0,
            byType: { photos: {}, reels: {}, tiktok: {} },
            streak: 0,
            recentAppearances: [],
          };
        }
        const a = out[key];
        a.appearances += 1;
        if (p.posicao === 1) a.topOnes += 1;
        (daysByHandle[key] ||= new Set()).add(r.date);
        {
          const likes = (p as any).extra?.likes ?? 0;
          if (likes > (bestLikesByHandle[key] ?? 0)) {
            bestLikesByHandle[key] = likes;
            a.bestPost = { value: fmtLikesCompact(likes), url: p.url, cover_url: p.cover_url };
          }
        }

        // melhores por tipo: engajamento (ER/VER/TER) e maior post em likes
        const bt = a.byType[c.kind as "photos" | "reels" | "tiktok"];
        if (bt) {
          if (c.ranking === "er" && p.metric_value.includes("%")) {
            const val = parseFloat(p.metric_value);
            if (!isNaN(val) && (bt.engagement === undefined || val > bt.engagement)) {
              bt.engagement = val;
              bt.engagementUrl = p.url;
            }
          }
          if (c.ranking === "likes") {
            const likes = (p as any).extra?.likes ?? 0;
            if (likes && (bt.likes === undefined || likes > bt.likes)) {
              bt.likes = likes;
              bt.likesUrl = p.url;
            }
          }
        }

        a.recentAppearances.push({
          date: r.date,
          posicao: p.posicao,
          metric: `${p.metric_value} ${p.metric_label}`,
          url: p.url,
          cover_url: p.cover_url,
        });
      }
    }
  }

  for (const [key, a] of Object.entries(out)) {
    // streak: dias consecutivos mais recentes em que apareceu
    const days = daysByHandle[key] || new Set<string>();
    let s = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (days.has(allDays[i])) s++;
      else break;
    }
    a.streak = s;
    // posts mais recentes primeiro, limitado pra não inflar
    a.recentAppearances.sort((x, y) => y.date.localeCompare(x.date) || x.posicao - y.posicao);
    a.recentAppearances = a.recentAppearances.slice(0, 36);
  }
  return out;
}

export type EngPopRow = { handle: string; club: string; flag: string; er: number; likes: number };

// A tese da marca: engajamento ≠ popularidade. Retorna os top-10 por ER médio
// (os "sentidos") vs os top-10 por pico de curtidas (os "vistos") — normalmente
// listas quase disjuntas. isNT filtra seleção vs clube (edição atual).
export function engagementVsPopularity(isNT: boolean): { byEngagement: EngPopRow[]; byPopularity: EngPopRow[]; overlap: number } {
  const stats: Record<string, { club: string; flag: string; liga: string; erSum: number; erN: number; peakLikes: number }> = {};
  for (const r of getAllReports()) {
    for (const c of r.carousels) {
      for (const p of c.posts) {
        const key = canonicalHandle(p.handle);
        const s = stats[key] || (stats[key] = { club: p.club, flag: p.flag, liga: p.liga, erSum: 0, erN: 0, peakLikes: 0 });
        if (c.ranking === "er" && p.metric_value.includes("%")) {
          const v = parseFloat(p.metric_value);
          if (!isNaN(v)) { s.erSum += v; s.erN += 1; }
        }
        const l = p.extra?.likes ?? 0;
        if (l > s.peakLikes) s.peakLikes = l;
      }
    }
  }
  const rows = Object.entries(stats)
    .filter(([, s]) => isNationalTeam(s.liga) === isNT && s.erN > 0)
    .map(([handle, s]) => ({ handle, club: s.club, flag: s.flag, er: s.erSum / s.erN, likes: s.peakLikes }));
  const byEngagement = [...rows].sort((a, b) => b.er - a.er).slice(0, 10);
  const byPopularity = [...rows].sort((a, b) => b.likes - a.likes).slice(0, 10);
  const popSet = new Set(byPopularity.map((r) => r.handle));
  const overlap = byEngagement.filter((r) => popSet.has(r.handle)).length;
  return { byEngagement, byPopularity, overlap };
}

export type TeamSeries = { handle: string; club: string; flag: string; series: { date: string; value: number }[] };

// Série temporal por time (ER por followers OU likes brutos) — pra ferramenta de comparação.
// likes inclui todas as categorias (RM domina em likes; em ER quase não aparece). ≥3 pontos.
export function metricTimeSeries(isNT: boolean, metric: "er" | "likes"): TeamSeries[] {
  const map: Record<string, { club: string; flag: string; liga: string; byDate: Record<string, { sum: number; n: number; max: number }> }> = {};
  for (const r of getAllReports()) {
    for (const c of r.carousels) {
      if (metric === "er" ? (c.ranking !== "er" || c.kind === "tiktok") : c.ranking !== "likes") continue;
      for (const p of c.posts) {
        if (!isMonitored(p.handle, p.liga)) continue;
        const v = metric === "er" ? parseFloat(p.metric_value) : ((p as any).extra?.likes ?? 0);
        if (!v || isNaN(v)) continue;
        const key = canonicalHandle(p.handle);
        const s = map[key] || (map[key] = { club: p.club, flag: p.flag, liga: p.liga, byDate: {} });
        const d = s.byDate[r.date] || (s.byDate[r.date] = { sum: 0, n: 0, max: 0 });
        d.sum += v; d.n += 1; d.max = Math.max(d.max, v);
      }
    }
  }
  const out: TeamSeries[] = [];
  for (const [handle, s] of Object.entries(map)) {
    if (isNationalTeam(s.liga) !== isNT) continue;
    const series = Object.entries(s.byDate)
      .map(([date, d]) => ({ date, value: metric === "er" ? d.sum / d.n : d.max }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-40);
    if (series.length >= 3) out.push({ handle, club: s.club, flag: s.flag, series });
  }
  out.sort((a, b) => a.club.localeCompare(b.club));
  return out;
}
export const erTimeSeries = (isNT: boolean) => metricTimeSeries(isNT, "er");   // compat

export type LeagueAggregate = {
  liga: string;
  flag: string;
  totalAppearances: number;
  uniqueClubs: number;
  topClub: { handle: string; club: string; appearances: number } | null;
};

export function aggregateByLeague(): LeagueAggregate[] {
  const clubs = aggregateByClub();
  const map: Record<string, LeagueAggregate> = {};
  for (const c of Object.values(clubs)) {
    if (!c.liga) continue;
    if (!map[c.liga]) {
      map[c.liga] = {
        liga: c.liga,
        flag: c.flag,
        totalAppearances: 0,
        uniqueClubs: 0,
        topClub: null,
      };
    }
    const lg = map[c.liga];
    lg.totalAppearances += c.appearances;
    lg.uniqueClubs += 1;
    if (!lg.topClub || c.appearances > lg.topClub.appearances) {
      lg.topClub = { handle: c.handle, club: c.club, appearances: c.appearances };
    }
  }
  return Object.values(map).sort((a, b) => b.totalAppearances - a.totalAppearances);
}

export type Record_ = {
  type: "ER" | "Likes" | "VER" | "TER" | "TikTok Likes";
  kind: "photos" | "reels" | "tiktok";
  value: string;
  club: string;
  handle: string;
  flag: string;
  liga: string;
  date: string;
  url: string;
};

type BestRecord = { val: number; club: string; handle: string; flag: string; liga: string; date: string; url: string };

// sorteio/patrocinado co-marca não vale recorde (o #1 era um sorteio com marca de cerveja)
const GIVEAWAY = /\b(sorteio|giveaway|sorteo|concurso|regal\w*|ganhe|gána|patrocinad)/i;
const fmtLikes = (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}K`);

function computeRecords(reports: DayReport[], keep: (liga: string) => boolean): Record_[] {
  let bestEr: BestRecord | null = null;
  let bestVer: BestRecord | null = null;
  let bestTer: BestRecord | null = null;
  let bestLikes: BestRecord | null = null;
  let bestTtLikes: BestRecord | null = null;

  for (const r of reports) {
    for (const c of r.carousels) {
      for (const p of c.posts) {
        if (!keep(p.liga || "")) continue;
        if (!isNationalTeam(p.liga) && !MONITORED.has(canonicalHandle(p.handle))) continue;  // fora dos 57
        if (GIVEAWAY.test(p.caption_clean || "")) continue;                                    // sorteio não conta
        const ctx = { club: p.club, handle: p.handle, flag: p.flag, liga: p.liga, date: r.date, url: p.url };

        if (c.kind === "photos" && c.ranking === "er") {
          const v = parseFloat(p.metric_value);
          if (!isNaN(v) && (!bestEr || v > bestEr.val)) bestEr = { ...ctx, val: v };
        }
        if (c.kind === "reels" && c.ranking === "er") {
          const v = parseFloat(p.metric_value);
          if (!isNaN(v) && (!bestVer || v > bestVer.val)) bestVer = { ...ctx, val: v };
        }
        if (c.kind === "tiktok" && c.ranking === "er") {
          const v = parseFloat(p.metric_value);
          if (!isNaN(v) && (!bestTer || v > bestTer.val)) bestTer = { ...ctx, val: v };
        }
        if (c.ranking === "likes") {
          const likes = (p as any).extra?.likes ?? 0;
          if (likes && (!bestLikes || likes > bestLikes.val)) bestLikes = { ...ctx, val: likes };
          if (c.kind === "tiktok" && likes && (!bestTtLikes || likes > bestTtLikes.val)) bestTtLikes = { ...ctx, val: likes };
        }
      }
    }
  }

  const records: Record_[] = [];
  if (bestEr) records.push({ type: "ER", kind: "photos", value: `${bestEr.val.toFixed(2)}%`, ...bestEr });
  if (bestVer) records.push({ type: "VER", kind: "reels", value: `${bestVer.val.toFixed(2)}%`, ...bestVer });
  if (bestTer) records.push({ type: "TER", kind: "tiktok", value: `${bestTer.val.toFixed(2)}%`, ...bestTer });
  if (bestLikes) records.push({ type: "Likes", kind: "photos", value: fmtLikes(bestLikes.val), ...bestLikes });
  if (bestTtLikes) records.push({ type: "TikTok Likes", kind: "tiktok", value: fmtLikes(bestTtLikes.val), ...bestTtLikes });
  return records;
}

// Recordes separados: clubes e seleções não competem no mesmo "hall".
export function getRecords(): { clubs: Record_[]; teams: Record_[] } {
  const reports = getAllReports();
  return {
    clubs: computeRecords(reports, (liga) => !isNationalTeam(liga)),
    teams: computeRecords(reports, (liga) => isNationalTeam(liga)),
  };
}
