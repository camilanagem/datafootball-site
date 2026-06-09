import { getAllReports } from "./aggregations";
import { getEdition, isNationalTeam } from "./edition";

export type WeekLeader = {
  handle: string;
  club: string;
  flag: string;
  appearances: number;
  topOnes: number;
  streak: number; // dias consecutivos (mais recentes) aparecendo
};

export type WeekPost = {
  club: string;
  flag: string;
  handle: string;
  value: string;
  url: string;
};

export type ThisWeek = {
  dayCount: number;
  leaders: WeekLeader[];
  topPost: WeekPost | null;
};

function fmtLikes(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

// Resumo da semana — agrega só os dias da EDIÇÃO atual (seleções no torneio,
// clubes fora dele), pra não misturar como acontecia no Hall of Fame.
export function getThisWeek(maxLeaders = 6): ThisWeek {
  const { isTournament } = getEdition();
  const reports = getAllReports()
    .filter((r) => {
      const first = r.carousels[0]?.posts?.[0];
      if (!first) return false;
      return isNationalTeam(first.liga || "") === isTournament;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const recent = reports.slice(-7);
  const recentDates = recent.map((r) => r.date);

  const stats: Record<
    string,
    { handle: string; club: string; flag: string; appearances: number; topOnes: number; days: Set<string> }
  > = {};

  let topPost: WeekPost | null = null;
  let maxLikes = 0;

  for (const r of recent) {
    for (const c of r.carousels) {
      for (const p of c.posts) {
        const s =
          stats[p.handle] ||
          (stats[p.handle] = {
            handle: p.handle,
            club: p.club,
            flag: p.flag,
            appearances: 0,
            topOnes: 0,
            days: new Set<string>(),
          });
        s.appearances += 1;
        if (p.posicao === 1) s.topOnes += 1;
        s.days.add(r.date);

        const likes = p.extra?.likes ?? 0;
        if (likes > maxLikes) {
          maxLikes = likes;
          topPost = { club: p.club, flag: p.flag, handle: p.handle, value: fmtLikes(likes), url: p.url };
        }
      }
    }
  }

  const streakOf = (days: Set<string>): number => {
    let n = 0;
    for (let i = recentDates.length - 1; i >= 0; i--) {
      if (days.has(recentDates[i])) n++;
      else break;
    }
    return n;
  };

  const leaders = Object.values(stats)
    .map((s) => ({
      handle: s.handle,
      club: s.club,
      flag: s.flag,
      appearances: s.appearances,
      topOnes: s.topOnes,
      streak: streakOf(s.days),
    }))
    .sort((a, b) => b.appearances - a.appearances || b.topOnes - a.topOnes)
    .slice(0, maxLeaders);

  return { dayCount: recent.length, leaders, topPost };
}
