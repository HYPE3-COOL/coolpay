'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import {
    usePrivy,
    useToken,
    useLogout,
    useLogin,
    User,
    useDelegatedActions,
} from '@privy-io/react-auth';

import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface AuthProviderProps {
    children: ReactNode;
}

interface AuthContextValue {
    login: () => void;
    logout: () => void;
    authenticated: boolean;
    user?: User | null;
}

export const AuthContext = createContext<AuthContextValue>({
    login: () => { },
    logout: () => { },
    authenticated: false,
    user: null,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {

    const router = useRouter();
    const { ready, authenticated, user } = usePrivy();
    const { wallets } = useSolanaWallets();
    const { getAccessToken } = useToken();
    const { delegateWallet } = useDelegatedActions();

    // logout
    const { logout } = useLogout({
        onSuccess: () => {
            notifications.show({
                title: 'Logout Successful',
                message: 'You have been logged out successfully.',
                color: 'teal',
                autoClose: 6000,
            });

            router.push('/');
        },
    });

    useEffect(() => {
        if (ready && authenticated) {
            if (user && user?.wallet) {
                if (!user.wallet?.delegated) {
                    // delegate the wallet if not already delegated
                    delegateWallet({ address: user.wallet?.address, chainType: 'solana' })
                        .then(() => {
                            notifications.show({
                                title: 'Wallet Delegated',
                                message: 'Your wallet has been successfully delegated.',
                                color: 'teal',
                                autoClose: 6000,
                            });
                        })
                        .catch((error) => {
                            notifications.show({
                                title: 'Delegation Failed',
                                message: 'Failed to delegate your wallet. Please try again.',
                                color: 'red',
                                autoClose: 6000,
                            });
                        });
                }
            }
        }
    }, [ready, authenticated, user, wallets]);


    const { login } = useLogin({
        onComplete: async () => {
            const accessToken = await getAccessToken();

            if (accessToken) {
                try {
                    const response = await fetch('/api/v1/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({}),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to sign up');
                    }

                    const data = await response.json();


                    notifications.show({
                        title: 'Login Successful',
                        message: `Welcome ${data.username} to Coolpay!`,
                        color: 'teal',
                        autoClose: 6000,
                    })
                } catch (error) {
                    console.error('Signup error:', error);
                }
            }
        },
    });

    const value: AuthContextValue = {
        login,
        logout,
        authenticated,
        user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);