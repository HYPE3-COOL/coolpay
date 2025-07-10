import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const username = params.username;
    if (!username) return new Response('Missing username', { status: 400 });

    const creator = await CoolPayService.getUserByUsername(username);

    if (!creator || !creator.twitter_id) {
      return new Response('Creator not found', { status: 404 });
    }

    const creatorTwitterId = creator.twitter_id
   
    const activities = await CoolPayService.getActivities({
      creator_id: BigInt(creatorTwitterId),
    })

    // const requests = activities.length;
    // const responses = activities.filter(s => (s.response_count ?? 0) > 0).length;
    // const responseRate = requests > 0 ? responses / requests : 0;
    // const totalAmount = activities.reduce((sum, s) => sum + (typeof s.amount === 'bigint' ? Number(s.amount) : (s.amount ? parseFloat(s.amount) : 0)), 0);
    // const avgCost = requests > 0 ? totalAmount / requests : 0;

    return Response.json({
      data: creator,
      // data: {
      //   ...creator,
      //   requests,
      //   responseRate,
      //   avgCost,
      // }
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
