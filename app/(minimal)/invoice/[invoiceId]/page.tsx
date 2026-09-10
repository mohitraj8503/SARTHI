import Link from 'next/link';

export const dynamic = 'force-dynamic';

function InvoiceUnavailableState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8F5EE] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-[#E8E2D9] bg-white p-12 text-center shadow-[0_32px_80px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-8 text-7xl select-none animate-bounce">
          🥺
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#1A3C2E] uppercase">{title}</h1>
        <p className="mt-6 text-base font-semibold leading-relaxed text-slate-500 max-w-md mx-auto">{description}</p>
        <div className="mt-10">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function InvoicePage({ params }: { params: { invoiceId: string } }) {
  return (
    <InvoiceUnavailableState
      title="Invoice Pending"
      description="Invoice cannot be given to you because it is pending from the SARTHI team."
    />
  );
}
