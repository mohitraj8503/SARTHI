import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CertificateRedirectPage({
  params
}: {
  params: { id: string }
}) {
  const { id } = params;
  redirect(`/verify/${encodeURIComponent(id)}`);
}
