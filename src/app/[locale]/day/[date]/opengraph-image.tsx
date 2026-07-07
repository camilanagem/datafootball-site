import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDayReport } from "@/lib/data";

export const alt = "DataFootball — daily football engagement ranking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const report = getDayReport(date);
  const font = await readFile(join(process.cwd(), "assets/Geist-Regular.ttf"));

  // o pico do dia: melhor ER entre os carrosséis de engajamento do IG
  let club = "";
  let metric = "";
  if (report) {
    let best: { club: string; v: number; mv: string } | null = null;
    for (const c of report.carousels) {
      if (c.ranking !== "er" || c.kind === "tiktok") continue;
      for (const p of c.posts) {
        const v = parseFloat(p.metric_value);
        if (!isNaN(v) && (!best || v > best.v)) best = { club: p.club, v, mv: p.metric_value };
      }
    }
    if (best) { club = best.club; metric = `${best.mv} engagement`; }
  }

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between",
                    width: "100%", height: "100%", background: "#000", color: "#fff",
                    padding: 76, fontFamily: "Geist" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 5, opacity: 0.65 }}>
          <div>DATAFOOTBALL</div>
          <div>{dateLabel}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, letterSpacing: 3, opacity: 0.55, marginBottom: 18 }}>
            {club ? "TOP ENGAGEMENT OF THE DAY" : "DAILY ENGAGEMENT RANKING"}
          </div>
          <div style={{ fontSize: club ? 108 : 76, lineHeight: 1.02 }}>
            {club || "Football, ranked by engagement."}
          </div>
          {metric && <div style={{ fontSize: 60, opacity: 0.85, marginTop: 16 }}>{metric}</div>}
        </div>
        <div style={{ fontSize: 26, opacity: 0.5 }}>datafootball.co — engagement, not followers</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font, style: "normal", weight: 400 }] },
  );
}
