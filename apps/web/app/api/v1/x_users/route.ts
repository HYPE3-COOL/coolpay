export const dynamic = 'force-dynamic';

// import '@/app/polyfills';
import { type NextRequest, NextResponse } from 'next/server';

import { count, desc } from 'drizzle-orm';
import { db } from '@/db';
import { xUser } from '@/db/schema/x';

export async function GET(request: NextRequest) {
  try {
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') ?? '10');
    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1');
    const offset = (page - 1) * pageSize;

    const result = await db.select({ count: count() }).from(xUser);
    const totalCount = result[0].count;

    const data = await db
      .select()
      .from(xUser)
      .orderBy(desc(xUser.id))
      .limit(pageSize)
      .offset(offset);

    const meta = {
      count: data.length ?? 0,
      total: totalCount ?? 0,
      page,
      pageCount: Math.ceil(totalCount / pageSize) ?? 0,
      pageSize: pageSize,
    };

    return NextResponse.json({
      data,
      meta,
    });
    // return Response.json({ data, meta });

  } catch (error) {
    console.error('Database query failed:', error); // Log the error for debugging
    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });

    // return new Response(`Internal Server Error: ${JSON.stringify(error)}`, { status: 500 }); // Return descriptive error
  }
}

