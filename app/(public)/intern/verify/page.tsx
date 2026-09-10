import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function InternVerifyPage() {
  redirect('/verify/interns');
}
