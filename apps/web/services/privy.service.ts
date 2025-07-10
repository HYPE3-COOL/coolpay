// server side service for Privy
import { getPrivyClient } from "@/utils/privy/privyServerClient";
import { User, SolanaCaip2ChainId } from "@privy-io/server-auth";

export class PrivyService {
    static async getUserByTwitterUsername(username: string): Promise<User | null> {
        const client = getPrivyClient();
        return await client.getUserByTwitterUsername(username);
    }

    static async getUserByTwitterId(twitterId: string): Promise<User | null> {
        const client = getPrivyClient();
        return await client.getUserByTwitterSubject(twitterId);
    }

    static async getUserById(userId: string): Promise<User | null> {
        const client = getPrivyClient();
        return await client.getUserById(userId);
    }

    static getActiveWalletFromPrivyUser(user: User): any | null {
        if (!user || !user.linkedAccounts) return null;
        // Filter wallets of type 'wallet'
        const wallets = user.linkedAccounts.filter((account: any) => account.type === 'wallet');
        if (wallets.length === 0) return null;
        if (wallets.length === 1) return wallets[0];
        // Prefer non-embedded wallet if available
        const nonPrivyWallet = wallets.find(
            (account: any) => !(
                account.walletClientType === 'privy' &&
                account.connectorType === 'embedded'
            )
        );
        return nonPrivyWallet || wallets[0];
    }


    static isPrivyEmbeddedDelegateWallet(wallet: any): boolean {
        return (
            wallet &&
            wallet.walletClientType === 'privy' &&
            wallet.connectorType === 'embedded' &&
            wallet.delegated === true
        );
    }


    // https://docs.privy.io/guide/server/wallets/new-user
    // pregenerate self-custodial solana embedded wallet while creating a new user with twitter ID
    static async pregeneratePrivyUserByTwitter(data: {
        id: string;
        username: string;
        name: string;
        image: string;
    }): Promise<User> {
        const client = getPrivyClient();
        return await client.importUser({
            linkedAccounts: [
                {
                    type: 'twitter_oauth',
                    subject: data.id,
                    username: data.username,
                    name: data.name,
                    profilePictureUrl: data.image,
                },
            ],
            createEthereumWallet: false,
            createSolanaWallet: true,
            createEthereumSmartWallet: false,
            // customMetadata: {
            //   username: data.username,
            //   isVerified: true,
            //   isAdmin: true,
            //   // age: 23,
            // },
        });
    }

    static getCaip2ByCluster(cluster: string): SolanaCaip2ChainId {
        switch (cluster) {
            case 'mainnet-beta':
                return 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
            case 'devnet':
                return 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';
            case 'testnet':
                return 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z';
            default:
                throw new Error(`Unsupported cluster: ${cluster}`);
        }
    }
}