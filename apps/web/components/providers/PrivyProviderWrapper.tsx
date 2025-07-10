'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors, useFundWallet } from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: true,
});

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
    // const isTest = process.env.NEXT_PUBLIC_ENV === 'prod' ? false : true;

    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
            config={{
                embeddedWallets: {
                    solana: {
                        createOnLogin: 'users-without-wallets',
                    },
                    // createOnLogin: "off", // 'off', 'users-without-wallets', and 'all-users'
                    // requireUserPasswordOnCreate: false,
                },
                appearance: {
                    walletChainType: 'solana-only',
                    logo: '/assets/images/logo-1x.png',
                    landingHeader: 'Welcome to Coolpay',
                    accentColor: '#6A6FF5',
                    theme: '#222224',
                    showWalletLoginFirst: false,
                    walletList: ['detected_solana_wallets'],
                },
                externalWallets: {
                    solana: {
                        connectors: solanaConnectors,
                    },
                },
                solanaClusters: [
                    {
                        name: 'devnet',
                        rpcUrl: 'https://api.devnet.solana.com',
                    },
                    {
                        name: 'mainnet-beta',
                        rpcUrl: 'https://api.mainnet-beta.solana.com',
                    }
                ],
                loginMethods: ['twitter'],
                fundingMethodConfig: {
                    moonpay: {
                        useSandbox: true,
                    },
                },
                mfa: {
                    noPromptOnMfaRequired: false,
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}