import { PrivyClient } from '@privy-io/server-auth';

let privyClient: PrivyClient | null = null;

export function getPrivyClient() {
    if (!privyClient) {
        privyClient = new PrivyClient(
            process.env.PRIVY_APP_ID!,
            process.env.PRIVY_APP_SECRET!
        );
    }
    return privyClient;
}