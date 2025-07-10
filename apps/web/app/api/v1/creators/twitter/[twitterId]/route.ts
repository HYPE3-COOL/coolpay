import '@/app/polyfills';
import { db } from '@/db';

import { user } from '@/db/schema/user';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest, { params }: { params: { twitterId: string } }) {
  try {
    const twitter_id = params.twitterId;
    if (!twitter_id) return new Response('Missing creator twitter user id', { status: 400 });

    const creator = await CoolPayService.getUserByTwitterId(BigInt(twitter_id));
    
    
    // const creator = await db
    //   .select()
    //   .from(user)
    //   .where(eq(user.twitter_id, BigInt(twitter_id)));


    if (!creator || !creator.twitter_id) {
      return new Response('Creator not found', { status: 404 });
    }

    const activities = await CoolPayService.getActivities({
      creator_id: BigInt(twitter_id),
    })

    // const requests = activities.length;
    // const responses = activities.filter(s => (s.response_count ?? 0) > 0).length;
    // const responseRate = requests > 0 ? responses / requests : 0;
    // const totalAmount = activities.reduce((sum, s) => sum + (typeof s.amount === 'bigint' ? Number(s.amount) : (s.amount ? parseFloat(s.amount) : 0)), 0);
    // const avgCost = requests > 0 ? totalAmount / requests : 0;

    return Response.json({
      data: creator,
      // data: {
      //   ...creator[0],
      //   requests,
      //   responseRate,
      //   avgCost,
      // }
    });
  } catch (error) {
    console.error('Failed to fetch creator tweet statistics:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
