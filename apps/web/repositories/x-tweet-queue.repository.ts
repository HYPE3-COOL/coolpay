import { db } from '@/db';
import { xTweetQueue, XTweetQueueInsert, XTweetQueueSelect } from '@/db/schema/x-tweet-queue';
import { eq, and, inArray, count, desc, or, sql } from 'drizzle-orm';
import { XTweetQueueFailedReason, XTweetQueueStatus, XTweetQueueType } from '@/interfaces/x-tweet-queue.interface';
import { IPaginationOptions } from '@/interfaces/base.interface';

export interface IXTweetQueueFilter {
    tweet_id?: bigint;
    status?: XTweetQueueStatus;
    type?: XTweetQueueType;
    failed_reason?: XTweetQueueFailedReason;
    q?: string; // text search
}

export class XTweetQueueRepository {
    private buildWhereClause(filter?: IXTweetQueueFilter) {
        if (!filter) return undefined;
        const clauses = [];
        if (filter.tweet_id !== undefined) clauses.push(eq(xTweetQueue.tweet_id, BigInt(filter.tweet_id)));
        if (filter.status !== undefined) clauses.push(eq(xTweetQueue.status, filter.status));
        if (filter.type !== undefined) clauses.push(eq(xTweetQueue.type, filter.type));
        if (filter.failed_reason !== undefined) clauses.push(eq(xTweetQueue.failed_reason, filter.failed_reason));
        if (filter.q !== undefined && filter.q !== "") {
            const q = `%${filter.q}%`;
            clauses.push(
                or(
                    sql`CAST(${xTweetQueue.tweet_id} AS TEXT) ILIKE ${q}`,
                    sql`${xTweetQueue.status} ILIKE ${q}`,
                    sql`${xTweetQueue.type} ILIKE ${q}`,
                    sql`${xTweetQueue.failed_reason} ILIKE ${q}`
                )
            );
        }
        return clauses.length > 0 ? and(...clauses) : undefined;
    }

    async count(filter?: IXTweetQueueFilter): Promise<number> {
        const whereClause = this.buildWhereClause(filter);
        const [{ count: totalCount }] = await db.select({ count: count() }).from(xTweetQueue).where(whereClause);
        return Number(totalCount);
    }

    async list(filter?: IXTweetQueueFilter, options?: IPaginationOptions): Promise<XTweetQueueSelect[]> {
        const whereClause = this.buildWhereClause(filter);
        let query: any = db.select().from(xTweetQueue).where(whereClause).orderBy(desc(xTweetQueue.id));
        if (options?.limit !== undefined) query = query.limit(options.limit);
        if (options?.offset !== undefined) query = query.offset(options.offset);
        const results: XTweetQueueSelect[] = await query;
        return results;
    }

    async getByTweetId(x_tweet_id: bigint): Promise<XTweetQueueSelect | undefined> {
        const [result] = await db.select().from(xTweetQueue)
            .where(eq(xTweetQueue.tweet_id, BigInt(x_tweet_id))).limit(1);
        return result;
    }

    async updateById(id: bigint, data: Partial<XTweetQueueInsert>): Promise<XTweetQueueSelect | undefined> {
        const [result] = await db
            .update(xTweetQueue)
            .set(data)
            .where(eq(xTweetQueue.id, id))
            .returning();
        return result;
    }

    async updateByTweetId(x_tweet_id: bigint, data: Partial<XTweetQueueInsert>): Promise<XTweetQueueSelect | undefined> {
        const [result] = await db
            .update(xTweetQueue)
            .set(data)
            .where(eq(xTweetQueue.tweet_id, BigInt(x_tweet_id)))
            .returning();
        return result;
    }
}