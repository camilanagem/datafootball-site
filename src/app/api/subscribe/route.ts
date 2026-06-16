import { NextResponse } from "next/server";

// Rota de captura de email -> cria assinante no Beehiiv (publication "DATA FOOTBAL").
// Credenciais no .env.local (BEEHIIV_API_KEY / BEEHIIV_PUB_ID) — nunca no client.
export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = (body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  const key = process.env.BEEHIIV_API_KEY;
  const pub = process.env.BEEHIIV_PUB_ID;
  if (!key || !pub) {
    console.error("[subscribe] BEEHIIV_API_KEY / BEEHIIV_PUB_ID ausentes");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pub}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: "datafootball.co",
          referring_site: "datafootball.co",
        }),
      }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[subscribe] beehiiv", res.status, txt.slice(0, 300));
      return NextResponse.json({ ok: false, error: "provider_error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[subscribe] falhou", e);
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
