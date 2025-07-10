import '@/app/polyfills';
import { NextRequest, NextResponse } from 'next/server';

import { getUserFromRequest } from '@/utils/server/auth';
import { CoolPayService } from '@/services/coolpay.service';
import { ITransactionFilter } from '@/repositories';
import { TransactionStatus } from '@/interfaces';

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const query = url.searchParams;

  try {
    const privyUserId = await getUserFromRequest(request);
    const user = await CoolPayService.getUserByPrivyId(privyUserId);

    const pageSize = parseInt(query.get('pageSize') ?? '100');    // TBC
    const page = parseInt(query.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    const filter: ITransactionFilter = {};
    // if (user) filter.user_id = BigInt(user.id);
    if (user) {
      filter.q = user.privy_wallet_address,
      filter.status = TransactionStatus.Confirmed
    }

    const totalCount = await CoolPayService.countTransactions(filter);
    const transactions = await CoolPayService.getTransactions(filter, { limit: pageSize, offset });

    const meta = {
      count: transactions.length,
      total: totalCount,
      page,
      pageCount: Math.ceil(totalCount / pageSize),
      pageSize,
    };

    return NextResponse.json({ data: transactions, meta });
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Failed to fetch transactions' }, { status: 500 });
  }
} 

export async function POST(request: NextRequest) {
  try {
    const privyUserId = await getUserFromRequest(request);
    const user = await CoolPayService.getUserByPrivyId(privyUserId);
    if (!user) {
      throw new Error('Unauthorized');
    }

    const body = await request.json();
    const result = await CoolPayService.createTransaction({
      ...body,
      amount: body.amount !== undefined ? BigInt(body.amount) : undefined,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Transaction record created successfully', data: result }, { status: 201 });
  } catch (error) {
    console.error('Failed to record transaction:', error);
    return NextResponse.json({ message: 'Failed to record transaction' }, { status: 500 });
  }
}

