import { redirect } from "@/i18n/navigation";

// /standings foi fundido no Hall of Fame (fica a classificação como seção de lá).
// Redireciona pra não quebrar links/SEO antigos.
export default async function StandingsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/hall-of-fame", locale });
}
