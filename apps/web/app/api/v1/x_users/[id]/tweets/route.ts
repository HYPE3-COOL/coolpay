export const dynamic = 'force-dynamic';

import '@/app/polyfills';
import { and, count, desc, eq, gt, lt, SQL } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/db';
// import { user } from '@/db/schema/user';
// import { Cursor } from '@/utils/string';
import { xTweet } from '@/db/schema/x';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

    const table = xTweet;

    try {
        const userId = BigInt(params.id)
        const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') ?? '10');
        const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1');
        const offset = (page - 1) * pageSize;

        // const total = await db.select({ count: () }).from(user).then(res => res[0]?.count ?? 0);
        const result = await db.select({ count: count() }).from(table);
        const totalCount = result[0].count;

        const data = await db
            .select()
            .from(table)
            .where(eq(table.author_id, userId))
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
