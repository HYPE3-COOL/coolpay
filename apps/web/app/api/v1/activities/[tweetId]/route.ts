import '@/app/polyfills';
import { NextRequest } from 'next/server';

import { CoolPayService } from '@/services/coolpay.service';

export async function GET(_req: NextRequest, { params }: { params: { tweetId: string } }) {
    const tweetId = params.tweetId;
    if (!tweetId) return new Response('Missing tweetId', { status: 400 });

    const activity = await CoolPayService.getActivityByTweetId(BigInt(tweetId));

    if (!activity) return new Response('Not found', { status: 404 });
    
    return Response.json({ data: activity });
}
