import { PrivyClient } from '@privy-io/server-auth';
import { env } from '@/env';
import axios from 'axios';

export const privyClient = new PrivyClient(
    env.PRIVY_APP_ID,
    env.PRIVY_APP_SECRET,
);


export const getPrivyUser = async (privyUserId: string): Promise<any> => {
    try {
        const response = await axios.get(
            `https://auth.privy.io/api/v1/users/${privyUserId}`,
            {
                auth: {
                    username: env.PRIVY_APP_ID,
                    password: env.PRIVY_APP_SECRET,
                },
                headers: {
                    'privy-app-id': env.PRIVY_APP_ID,
                },
            },
        );
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch privy user: ${error}`);
    }
}