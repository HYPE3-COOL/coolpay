import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { PAGE_SIZE } from '@/constants/constant';
import { CoolPayService } from '@/services/coolpay.service';
import { IUserFilter } from '@/repositories/user.repository';

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const query = url.searchParams;

  try {
    // Pagination params
    const pageSize = parseInt(query.get('pageSize') ?? String(PAGE_SIZE));
    const page = parseInt(query.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    // Parse filters from query params
    const filter: IUserFilter = { is_creator: true };
    // if (query.has('username')) filter.username = query.get('username')!;
    // if (query.has('twitter_id')) filter.twitter_id = BigInt(query.get('twitter_id')!);
    // // Add more filters as needed

    const totalCount = await CoolPayService.countUsers(filter);
    const creators = await CoolPayService.getUsers(filter, { limit: pageSize, offset });

    const meta = {
      count: creators.length ?? 0,
      total: totalCount ?? 0,
      page,
      pageCount: Math.ceil(totalCount / pageSize) ?? 0,
      pageSize,
    };

    return Response.json({ data: creators, meta });
  } catch (error) {
    console.error('Database query failed:', error);
    return new Response(`Internal Server Error: ${JSON.stringify(error)}`, { status: 500 });
  }
}