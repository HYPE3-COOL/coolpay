export const dynamic = 'force-dynamic';

import '@/app/polyfills';
import { type NextRequest } from 'next/server'

import { count, desc } from 'drizzle-orm';
import { db } from '@/db';
import { xTweet } from '@/db/schema/x';
import { env } from '@/env';

export async function GET(request: NextRequest) {

  const table = xTweet;

  try {
    const searchParams = request.nextUrl.searchParams
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10');
    const page = parseInt(searchParams.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    const result = await db.select({ count: count() }).from(table);
    const totalCount = result[0].count;

    const data = await db
      .select()
      .from(table)
      .orderBy(desc(table.id))
      .limit(pageSize)
      .offset(offset);

    const meta = {
      count: data.length ?? 0,
      total: totalCount ?? 0,
      page,
      pageCount: Math.ceil(totalCount / pageSize) ?? 0,
      pageSize: pageSize,
    };

    return Response.json({ data, meta });

  } catch (error) {
    console.error('Database query failed:', error); // Log the error for debugging
    return new Response(`Internal Server Error: ${JSON.stringify(error)}`, { status: 500 }); // Return descriptive error
  }
}

