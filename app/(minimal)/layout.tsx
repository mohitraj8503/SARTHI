// Minimal layout — no Header, no Footer, no MobileNav
// Used for: auth pages, checkout, payment, invoices, enrollment confirmation
export default function MinimalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}

