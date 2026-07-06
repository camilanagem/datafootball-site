import { redirect } from "@/i18n/navigation";

// /week foi consolidado no /insights (a home já mostra "mais ativos" + maior post).
// Redireciona pra não quebrar links/SEO antigos.
export default async function WeekRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/insights", locale });
}
