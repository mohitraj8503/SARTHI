import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyExamVerificationPage({
  params,
}: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = await params;
  redirect(`/verify/${encodeURIComponent(verificationId)}`);
}
