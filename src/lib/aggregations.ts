import fs from "node:fs";
import path from "node:path";
import { type DayReport, getAvailableDays } from "./data";
import { isNationalTeam } from "./edition";

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
  bestEr?: number;        // maior ER
  bestErUrl?: string;
  bestLikes?: number;
  bestLikesUrl?: string;
  recentAppearances: { date: string; posicao: number; metric: string; url: string }[];
};

export function aggregateByClub(): Record<string, ClubAggregate> {
  const reports = getAllReports();
  const out: Record<string, ClubAggregate> = {};

  for (const r of reports) {
    for (const c of r.carousels) {
      for (const p of c.posts) {
        const key = p.handle;
        if (!out[key]) {
          out[key] = {
            handle: p.handle,
            club: p.club,
            flag: p.flag,
            liga: p.liga,
            appearances: 0,
            topOnes: 0,
            recentAppearances: [],
          };
        }
        const a = out[key];
        a.appearances += 1;
        if (p.posicao === 1) a.topOnes += 1;

        // ER tracking (apenas pra carousels ER)
        if (c.ranking === "er" && p.metric_value.includes("%")) {
          const val = parseFloat(p.metric_value);
          if (!isNaN(val) && (a.bestEr === undefined || val > a.bestEr)) {
            a.bestEr = val;
            a.bestErUrl = p.url;
          }
        }
        // Likes tracking (apenas carousels likes)
        if (c.ranking === "likes") {
          const likes = (p as any).extra?.likes ?? 0;
          if (likes && (a.bestLikes === undefined || likes > a.bestLikes)) {
            a.bestLikes = likes;
            a.bestLikesUrl = p.url;
          }
        }

        if (a.recentAppearances.length < 8) {
          a.recentAppearances.push({
            date: r.date,
            posicao: p.posicao,
            metric: `${p.metric_value} ${p.metric_label}`,
            url: p.url,
          });
        }
      }
    }
  }

  return out;
}

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
  type: "ER" | "Likes" | "VER";
  value: string;
  club: string;
  handle: string;
  flag: string;
  liga: string;
  date: string;
  url: string;
};

type BestRecord = { val: number; club: string; handle: string; flag: string; liga: string; date: string; url: string };

function computeRecords(reports: DayReport[], keep: (liga: string) => boolean): Record_[] {
  let bestEr: BestRecord | null = null;
  let bestVer: BestRecord | null = null;
  let bestLikes: BestRecord | null = null;

  for (const r of reports) {
    for (const c of r.carousels) {
      for (const p of c.posts) {
        if (!keep(p.liga || "")) continue;
        const ctx = { club: p.club, handle: p.handle, flag: p.flag, liga: p.liga, date: r.date, url: p.url };

        if (c.kind === "photos" && c.ranking === "er") {
          const v = parseFloat(p.metric_value);
          if (!isNaN(v) && (!bestEr || v > bestEr.val)) bestEr = { ...ctx, val: v };
        }
        if (c.kind === "reels" && c.ranking === "er") {
          const v = parseFloat(p.metric_value);
          if (!isNaN(v) && (!bestVer || v > bestVer.val)) bestVer = { ...ctx, val: v };
        }
        if (c.ranking === "likes") {
          const likes = (p as any).extra?.likes ?? 0;
          if (likes && (!bestLikes || likes > bestLikes.val)) bestLikes = { ...ctx, val: likes };
        }
      }
    }
  }

  const records: Record_[] = [];
  if (bestEr) records.push({ type: "ER", value: `${bestEr.val.toFixed(2)}%`, ...bestEr });
  if (bestVer) records.push({ type: "VER", value: `${bestVer.val.toFixed(2)}%`, ...bestVer });
  if (bestLikes) records.push({
    type: "Likes",
    value: bestLikes.val >= 1_000_000 ? `${(bestLikes.val / 1_000_000).toFixed(1)}M` : `${Math.round(bestLikes.val / 1000)}K`,
    ...bestLikes,
  });
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
