'use client'

import { InternetCheck } from '@/utils'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ReactQueryProvider } from './ReactQueryProvider'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from '@/store'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <HeroUIProvider>

            <ReduxProvider store={store}>

                <ReactQueryProvider>

                    <AuthProvider>

                        {children}

                        <ToastProvider 
                            placement="top-right" 
                            toastOffset={10}
                        />
                        <InternetCheck />

                    </AuthProvider>

                </ReactQueryProvider>

            </ReduxProvider>

        </HeroUIProvider>
    )
}