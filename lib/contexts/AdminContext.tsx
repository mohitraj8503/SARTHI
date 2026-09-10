'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageAction {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface AdminContextType {
    primaryAction: PageAction | null;
    breadcrumb: BreadcrumbItem[] | null;
    pageTitle: string | null;
    isLoading: boolean;
    setPrimaryAction: (action: PageAction | null) => void;
    setBreadcrumbs: (items: BreadcrumbItem[]) => void;
    setPageTitle: (title: string) => void;
    setIsLoading: (loading: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [primaryAction, setPrimaryActionState] = useState<PageAction | null>(null);
    const [breadcrumb, setBreadcrumbsState] = useState<BreadcrumbItem[] | null>(null);
    const [pageTitle, setPageTitleState] = useState<string | null>(null);
    const [isLoading, setIsLoadingState] = useState(false);

    const setPrimaryAction = React.useCallback((action: PageAction | null) => {
        setPrimaryActionState(action);
    }, []);

    const setBreadcrumbs = React.useCallback((items: BreadcrumbItem[]) => {
        setBreadcrumbsState(items);
    }, []);

    const setPageTitle = React.useCallback((title: string) => {
        setPageTitleState(title);
    }, []);

    const setIsLoading = React.useCallback((loading: boolean) => {
        setIsLoadingState(loading);
    }, []);

    const value = React.useMemo(() => ({
        primaryAction, setPrimaryAction,
        breadcrumb, setBreadcrumbs,
        pageTitle, setPageTitle,
        isLoading, setIsLoading
    }), [primaryAction, breadcrumb, pageTitle, isLoading, setPrimaryAction, setBreadcrumbs, setPageTitle, setIsLoading]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
