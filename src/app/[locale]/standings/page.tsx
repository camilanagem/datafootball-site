import { redirect } from "@/i18n/navigation";

// /standings → /clubs (a classificação por clube vive na página de clubes agora, 04/ago).
export default async function StandingsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/clubs", locale });
}
