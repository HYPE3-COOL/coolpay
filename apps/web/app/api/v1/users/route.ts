import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { CoolPayService } from '@/services/coolpay.service';
import { IUserFilter } from '@/repositories/user.repository';
import { PAGE_SIZE } from '@/constants/constant';

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const query = url.searchParams;

  try {
    const pageSize = parseInt(query.get('pageSize') ?? String(PAGE_SIZE));
    const page = parseInt(query.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    // Parse filters from query params
    const filter: IUserFilter = {};
    if (query.has('privy_user_id')) filter.privy_user_id = query.get('privy_user_id')!;
    if (query.has('username')) filter.username = query.get('username')!;
    if (query.has('twitter_id')) filter.twitter_id = query.get('twitter_id')!;
    if (query.has('is_creator')) {
      const isCreatorValue = query.get('is_creator');
      if (isCreatorValue === 'true' || isCreatorValue === '1') {
        filter.is_creator = true;
      } else if (isCreatorValue === 'false' || isCreatorValue === '0') {
        filter.is_creator = false;
      }
    }
    if (query.has('is_admin')) {
      const isAdminValue = query.get('is_admin');
      if (isAdminValue === 'true' || isAdminValue === '1') {
        filter.is_admin = true;
      } else if (isAdminValue === 'false' || isAdminValue === '0') {
        filter.is_admin = false;
      }
    }
    if (query.has('q')) filter.q = query.get('q')!;

    const totalCount = await CoolPayService.countUsers(filter);
    const users = await CoolPayService.getUsers(filter, { limit: pageSize, offset });

    const meta = {
      count: users.length ?? 0,
      total: totalCount ?? 0,
      page,
      pageCount: Math.ceil(totalCount / pageSize) ?? 0,
      pageSize,
    };

    return Response.json({ data: users, meta });
  } catch (error) {
    console.error('Database query failed:', error);
    return new Response(`Internal Server Error: ${JSON.stringify(error)}`, { status: 500 });
  }
}
