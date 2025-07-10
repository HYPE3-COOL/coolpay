'use client';
import React, { ReactNode } from 'react'

import PrivyProviderWrapper from "@/components/providers/PrivyProviderWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AppProvider = ({ children }: { children: ReactNode }) => {

    const [queryClient] = React.useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <PrivyProviderWrapper>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </PrivyProviderWrapper>
        </QueryClientProvider>

    )
}

export default AppProvider;