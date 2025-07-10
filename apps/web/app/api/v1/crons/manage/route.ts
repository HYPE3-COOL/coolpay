import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { activity } from '@/db/schema/activity';

import { env } from '@/env';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // Get all creator ids that have activities
        const activities = await db
            .select({ creator_id: activity.creator_id })
            .from(activity)
            .groupBy(activity.creator_id);

        const creatorTwitterIds = activities.map(row => row.creator_id);

        for (const creatorTwitterId of creatorTwitterIds) {
            // Get all activities for this user (no transaction)
            const activities = await CoolPayService.getActivities({ creator_id: creatorTwitterId });

            const requests = activities.length;
            const responses = activities.filter(a => (a.response_count ?? 0) > 0).length;
            const responseRate = requests > 0 ? responses / requests : 0;
            const totalAmount = activities.reduce(
                (sum, a) => sum + (typeof a.amount === 'bigint' ? Number(a.amount) : (a.amount ? parseFloat(a.amount) : 0)),
                0
            );
            // const avgCost = requests > 0 ? totalAmount / requests : 0;
            const avgCost = requests > 0 ? Math.round(totalAmount / requests) : 0;

            await CoolPayService.updateUserByTwitterId(creatorTwitterId, {
                no_of_requests: requests,
                success_rate: responseRate,
                avg_cost: BigInt(avgCost),
            })
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('[GET /api/v1/crons/manage] Error updating user stats:', error);
        return Response.json({ success: false, error: error?.toString() });
    }
}
