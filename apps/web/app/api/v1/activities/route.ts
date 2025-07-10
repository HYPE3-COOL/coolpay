import '@/app/polyfills';
import { NextRequest } from 'next/server';

import { ActivityStatus, ActivityPaymentStatus } from '@/interfaces/activity.interface';
import { PAGE_SIZE } from '@/constants/constant';
import { CoolPayService } from '@/services/coolpay.service';
import { IActivityFilter } from '@/repositories/activity.repository';

export async function GET(request: NextRequest) {

  const url = new URL(request.nextUrl);
  const query = url.searchParams;

  try {
    const pageSize = parseInt(query.get('pageSize') ?? String(PAGE_SIZE));
    const page = parseInt(query.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    // Parse filters from query params
    const filter: IActivityFilter = {};
    if (query.has('user_id')) filter.user_id = BigInt(query.get('user_id')!);
    if (query.has('creator_id')) filter.creator_id = BigInt(query.get('creator_id')!);
    if (query.has('x_tweet_id')) filter.x_tweet_id = BigInt(query.get('x_tweet_id')!);
    if (query.has('status')) filter.status = query.get('status') as ActivityStatus;
    if (query.has('payment_status')) filter.payment_status = query.get('payment_status') as ActivityPaymentStatus;
    if (query.has('is_responsed')) filter.is_responsed = query.get('is_responsed') === 'true';
    if (query.has('is_live')) {
      const isLiveValue = query.get('is_live');
      // Accepts 'true'/'1' as true, 'false'/'0' as false
      if (isLiveValue === 'true' || isLiveValue === '1') {
        filter.is_live = true;
      } else if (isLiveValue === 'false' || isLiveValue === '0') {
        filter.is_live = false;
      }
    }
    if (query.has('q')) filter.q = query.get('q')!;

    const totalCount = await CoolPayService.countActivities(filter);
    const activities = await CoolPayService.getActivities(filter, { limit: pageSize, offset });

    const meta = {
      count: activities.length ?? 0,
      total: totalCount ?? 0,
      page,
      pageCount: Math.ceil(totalCount / pageSize) ?? 0,
      pageSize,
    };

    return Response.json({ data: activities, meta });
  } catch (error) {
    console.error('Database query failed:', error);
    return new Response(`Internal Server Error: ${JSON.stringify(error)}`, { status: 500 });
  }
}
