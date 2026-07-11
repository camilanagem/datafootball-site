import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import enData from "@/data/insights/latest.en.json";

export const alt = "DataFootball — weekly engagement insights";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = await readFile(join(process.cwd(), "assets/Geist-Regular.ttf"));
  const manchete = (enData.manchete || "The week the underdogs won the internet.").slice(0, 150);
  const label = (enData.week?.label || "").toUpperCase();

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between",
                    width: "100%", height: "100%", background: "#000", color: "#fff",
                    padding: 76, fontFamily: "Geist" }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 5, opacity: 0.65 }}>
          DATAFOOTBALL — WEEKLY INSIGHTS{label ? ` · ${label}` : ""}
        </div>
        <div style={{ display: "flex", fontSize: 62, lineHeight: 1.12 }}>{manchete}</div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.5 }}>
          datafootball.co — the football content that works
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: font, style: "normal", weight: 400 }] },
  );
}
