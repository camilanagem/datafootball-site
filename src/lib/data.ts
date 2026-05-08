import fs from "node:fs";
import path from "node:path";

export type Post = {
  posicao: number;
  club: string;
  handle: string;
  flag: string;
  liga: string;
  metric_label: string;
  metric_value: string;
  caption_clean: string;
  url: string;
  cover_url?: string;
};

export type Carousel = {
  kind: "photos" | "reels" | "tiktok";
  ranking: "er" | "likes";
  slot_time: string; // "10:00", "12:00" etc
  posts: Post[];
};

export type DayReport = {
  date: string; // YYYY-MM-DD
  carousels: Carousel[];
  totals?: {
    posts: number;
    er_avg?: number;
  };
};

const DATA_DIR = path.join(process.cwd(), "src", "data", "days");

export function getAvailableDays(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort()
    .reverse();
}

export function getDayReport(date: string): DayReport | null {
  const file = path.join(DATA_DIR, `${date}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as DayReport;
  } catch {
    return null;
  }
}

export const SLOT_BY_KIND: Record<string, { time: string; key: string }> = {
  "photos-er": { time: "10:00", key: "photosEngagement" },
  "reels-er": { time: "12:00", key: "reelsEngagement" },
  "photos-likes": { time: "14:00", key: "photosLikes" },
  "reels-likes": { time: "16:00", key: "reelsLikes" },
  "tiktok-er": { time: "18:00", key: "tiktokEngagement" },
  "tiktok-likes": { time: "20:00", key: "tiktokLikes" },
};

export const SLOTS_ORDER = [
  "photos-er",
  "reels-er",
  "photos-likes",
  "reels-likes",
  "tiktok-er",
  "tiktok-likes",
] as const;

// chips de calendário — 6 cores únicas, label completo, com horário
const CHIP_META: Record<string, { label: string; time: string; color: string }> = {
  "photos-er":    { label: "Photos Engagement", time: "10:00", color: "#1a1a1a" },
  "reels-er":     { label: "Reels Engagement",  time: "12:00", color: "#1e3a8a" },
  "photos-likes": { label: "Photos Likes",      time: "14:00", color: "#8b6f47" },
  "reels-likes":  { label: "Reels Likes",       time: "16:00", color: "#6b46c1" },
  "tiktok-er":    { label: "TikTok Engagement", time: "18:00", color: "#c8102e" },
  "tiktok-likes": { label: "TikTok Likes",      time: "20:00", color: "#5c8a4a" },
};

export type CalendarChip = {
  kind: string;
  ranking: string;
  label: string;
  time: string;
  color: string;
};

export type CalendarDay = {
  date: string;
  chips: CalendarChip[];
};

export function getCalendarDays(): CalendarDay[] {
  return getAvailableDays().map((date) => {
    const report = getDayReport(date);
    const chips = (report?.carousels || []).map((c) => {
      const key = `${c.kind}-${c.ranking}`;
      const meta = CHIP_META[key] || { label: c.kind, time: "", color: "#666666" };
      return { kind: c.kind, ranking: c.ranking, ...meta };
    });
    // ordena por horário
    chips.sort((a, b) => a.time.localeCompare(b.time));
    return { date, chips };
  });
}
