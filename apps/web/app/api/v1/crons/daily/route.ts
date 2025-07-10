import '@/app/polyfills';
import { NextRequest } from 'next/server';

import { env } from '@/env';
import { CoolPayService } from '@/services/coolpay.service';
import { usersByUsernames } from '@/utils/twitter-api';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 1. Get all usernames from user table
        const users = await CoolPayService.getUsers();
        const usernameToIdMap: Record<string, bigint> = {};
        const usernames: string[] = [];
        for (const u of users) {
            if (u.username) {
                usernames.push(u.username);
                usernameToIdMap[u.username] = u.twitter_id;
            }
        }

        console.log({ usernames, count: usernames.length });

        // 2. Batch usernames into groups of 100
        const BATCH_SIZE = 100;
        for (let i = 0; i < usernames.length; i += BATCH_SIZE) {
            const batch = usernames.slice(i, i + BATCH_SIZE);
            const twitterUsers = await usersByUsernames(batch);
            // 3. Update each user with public_metrics and no_of_followers
            for (const tUser of twitterUsers) {
                const twitterId = usernameToIdMap[tUser.username];
                if (!twitterId) continue;
                await CoolPayService.updateUserByTwitterId(twitterId, {
                    public_metrics: tUser.public_metrics,
                    no_of_followers: tUser.public_metrics?.followers_count ?? 0,
                });
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('[GET /api/v1/crons/manage] Error updating user stats:', error);
        return Response.json({ success: false, error: error?.toString() });
    }
}
