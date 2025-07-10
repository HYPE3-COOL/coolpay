import { NextRequest } from 'next/server';
import { CoolPayService } from '@/services/coolpay.service';
import { IXTweetQueueFilter } from '@/repositories/x-tweet-queue.repository';
import { PAGE_SIZE } from '@/constants/constant';
import { XTweetQueueStatus, XTweetQueueType, XTweetQueueFailedReason } from '@/interfaces/x-tweet-queue.interface';

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const query = url.searchParams;

  try {
    const pageSize = parseInt(query.get('pageSize') ?? String(PAGE_SIZE));
    const page = parseInt(query.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    // Parse filters from query params
    const filter: IXTweetQueueFilter = {};
    if (query.has('tweet_id')) filter.tweet_id = BigInt(query.get('tweet_id')!);
    if (query.has('status')) filter.status = query.get('status') as XTweetQueueStatus;
    if (query.has('type')) filter.type = query.get('type') as XTweetQueueType;
    if (query.has('failed_reason')) filter.failed_reason = query.get('failed_reason') as XTweetQueueFailedReason;
    if (query.has('q')) filter.q = query.get('q')!;

    const totalCount = await CoolPayService.countXTweetQueues(filter);
    const queues = await CoolPayService.getXTweetQueues(filter, { limit: pageSize, offset });

    const meta = {
      count: queues.length ?? 0,
      total: totalCount ?? 0,
      page,
      pageCount: Math.ceil(totalCount / pageSize) ?? 0,
      pageSize,
    };

    return Response.json({ data: queues, meta });
  } catch (error) {
    console.error('Database query failed:', error);
    return new Response(`Internal Server Error: ${JSON.stringify(error)}`, { status: 500 });
  }
}
