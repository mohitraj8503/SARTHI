'use client'

import Link from 'next/link'
import { ChevronLeft, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Breadcrumb {
    label: string
    href?: string
}

interface PageHeaderProps {
    title: string
    subtitle?: string
    breadcrumbs?: Breadcrumb[]
    showBackButton?: boolean
    backHref?: string
    actions?: React.ReactNode
}

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs,
    showBackButton = true,
    backHref,
    actions
}: PageHeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (backHref) {
            router.push(backHref)
        } else {
            router.back()
        }
    }

    return (
        <div className="space-y-6">
            {/* BREADCRUMBS */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-3 text-sm">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-500 hover:text-brand-orange transition-colors font-bold group"
                    >
                        <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Home
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="text-gray-300">/</span>
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="text-gray-500 hover:text-brand-orange transition-colors font-bold"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-brand-dark font-black">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            {/* HEADER WITH BACK BUTTON */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-start gap-4 flex-1">
                    {showBackButton && (
                        <button
                            onClick={handleBack}
                            className="p-3 hover:bg-gray-100 rounded-2xl text-gray-500 hover:text-brand-orange transition-all group shrink-0 mt-1"
                            title="Go back"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                    )}
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-gray-500 font-medium text-lg">{subtitle}</p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex gap-4 w-full lg:w-auto">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

