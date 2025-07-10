import { db } from '@/db';
import { xTweet } from '@/db/schema/x';

import { activity, ActivityInsert, ActivitySelect, user, ActivityFull } from '@/db/schema';
import { alias } from 'drizzle-orm/pg-core';
import { ActivityStatus } from '@/interfaces/activity.interface';
import { IPaginationOptions } from '@/interfaces/base.interface';
import { eq, and, count, desc, ne, or, sql } from 'drizzle-orm';


export interface IActivityFilter {
    user_id?: bigint;
    creator_id?: bigint;
    x_tweet_id?: bigint;
    status?: ActivityStatus;
    payment_status?: string;
    is_responsed?: boolean;
    is_live?: boolean;
    q?: string; // text search
}

export class ActivityRepository {
    private buildWhereClause(filter?: IActivityFilter) {
        const clauses = [];
        // Always exclude pending and rejected
        clauses.push(ne(activity.status, ActivityStatus.Pending));
        clauses.push(ne(activity.status, ActivityStatus.Rejected));
        if (filter) {
            if (filter.user_id !== undefined) clauses.push(eq(activity.user_id, BigInt(filter.user_id)));
            if (filter.creator_id !== undefined) clauses.push(eq(activity.creator_id, BigInt(filter.creator_id)));
            if (filter.x_tweet_id !== undefined) clauses.push(eq(activity.x_tweet_id, BigInt(filter.x_tweet_id)));
            if (filter.status) clauses.push(eq(activity.status, filter.status));
            if (filter.payment_status) clauses.push(eq(activity.payment_status, filter.payment_status));
            if (filter.is_responsed !== undefined) clauses.push(eq(activity.is_responsed, filter.is_responsed));
            if (filter.is_live !== undefined) clauses.push(eq(activity.is_live, filter.is_live));
            if (filter.q !== undefined && filter.q !== "") {
                const q = `%${filter.q}%`;
                console.log({q})
                clauses.push(
                    or(
                        sql`CAST(${activity.user_id} AS TEXT) ILIKE ${q}`,
                        sql`CAST(${activity.creator_id} AS TEXT) ILIKE ${q}`,
                        sql`CAST(${activity.x_tweet_id} AS TEXT) ILIKE ${q}`,
                        sql`CAST(${activity.first_reply_tweet_id} AS TEXT) ILIKE ${q}`,
                        sql`${activity.fund_hash} ILIKE ${q}`,
                        sql`${activity.refund_hash} ILIKE ${q}`,
                        sql`${activity.paid_hash} ILIKE ${q}`
                    )
                );
            }
        }
        return clauses.length > 1 ? and(...clauses) : clauses[0];
    }

    async count(filter?: IActivityFilter): Promise<number> {
        const whereClause = this.buildWhereClause(filter);
        const [{ count: totalCount }] = await db.select({ count: count() }).from(activity).where(whereClause);
        return Number(totalCount);
    }

    async list(filter?: IActivityFilter, options?: IPaginationOptions): Promise<ActivitySelect[]> {
        const whereClause = this.buildWhereClause(filter);
        let query: any = db.select().from(activity).where(whereClause).orderBy(desc(activity.id));

        if (options?.limit !== undefined) query = query.limit(options.limit);
        if (options?.offset !== undefined) query = query.offset(options.offset);

        const results: ActivitySelect[] = await query;
        return results;
    }

    async getByTweetId(x_tweet_id: bigint): Promise<ActivityFull | undefined> {
        const creatorUser = alias(user, 'creator');
        const replyTweet = alias(xTweet, 'replyTweet');
        const [result] = await db
            .select({
                activity: activity,
                user: {
                    no_of_requests: user.no_of_requests,
                    no_of_followers: user.no_of_followers,
                    success_rate: user.success_rate,
                    avg_cost: user.avg_cost,
                    username: user.username,
                    image: user.image,
                    twitter: user.twitter
                },
                creator: {
                    no_of_requests: creatorUser.no_of_requests,
                    no_of_followers: creatorUser.no_of_followers,
                    success_rate: creatorUser.success_rate,
                    avg_cost: creatorUser.avg_cost,
                    username: creatorUser.username,
                    image: creatorUser.image,
                    twitter: creatorUser.twitter
                },
                xTweet: xTweet,
                replyTweet: replyTweet
            })
            .from(activity)
            .innerJoin(user, eq(activity.user_id, user.twitter_id))
            .innerJoin(creatorUser, eq(activity.creator_id, creatorUser.twitter_id))
            .innerJoin(xTweet, eq(activity.x_tweet_id, xTweet.id))
            .leftJoin(replyTweet, eq(activity.first_reply_tweet_id, replyTweet.id))
            .where(
                and(
                    eq(activity.x_tweet_id, BigInt(x_tweet_id)),
                    ne(activity.status, ActivityStatus.Pending),
                    ne(activity.status, ActivityStatus.Rejected)
                )
            )
            .limit(1);
        if (!result) return undefined;
        return {
            ...result.activity,
            user: result.user,
            creator: result.creator,
            xTweet: result.xTweet,
            replyTweet: result.replyTweet
        };
    }

    async updateById(id: bigint, data: Partial<ActivityInsert>): Promise<ActivitySelect | undefined> {
        const [result] = await db
            .update(activity)
            .set(data)
            .where(eq(activity.id, BigInt(id)))
            .returning();
        return result;
    }

    async updateByTweetId(x_tweet_id: bigint, data: Partial<ActivityInsert>): Promise<ActivitySelect | undefined> {
        const [result] = await db
            .update(activity)
            .set(data)
            .where(eq(activity.x_tweet_id, BigInt(x_tweet_id)))
            .returning();
        return result;
    }

    async listWithJoin(filter?: IActivityFilter, options?: IPaginationOptions): Promise<ActivityFull[]> {
        const creatorUser = alias(user, 'creator');
        const replyTweet = alias(xTweet, 'replyTweet');
        const whereClause = this.buildWhereClause(filter);
        let query = db
            .select({
                activity: activity,
                user: {
                    no_of_requests: user.no_of_requests,
                    no_of_followers: user.no_of_followers,
                    success_rate: user.success_rate,
                    avg_cost: user.avg_cost,
                    username: user.username,
                    image: user.image,
                    twitter: user.twitter
                },
                creator: {
                    no_of_requests: creatorUser.no_of_requests,
                    no_of_followers: creatorUser.no_of_followers,
                    success_rate: creatorUser.success_rate,
                    avg_cost: creatorUser.avg_cost,
                    username: creatorUser.username,
                    image: creatorUser.image,
                    twitter: creatorUser.twitter
                },
                xTweet: xTweet,
                replyTweet: replyTweet
            })
            .from(activity)
            .innerJoin(user, eq(activity.user_id, user.twitter_id))
            .innerJoin(creatorUser, eq(activity.creator_id, creatorUser.twitter_id))
            .innerJoin(xTweet, eq(activity.x_tweet_id, xTweet.id))
            .leftJoin(replyTweet, eq(activity.first_reply_tweet_id, replyTweet.id))
            .where(whereClause)
            .orderBy(desc(activity.id));

        if (options?.limit !== undefined) query = (query as any).limit(options.limit);
        if (options?.offset !== undefined) query = (query as any).offset(options.offset);

        const results = await query;
        return results.map(result => ({
            ...result.activity,
            user: result.user,
            creator: result.creator,
            xTweet: result.xTweet,
            replyTweet: result.replyTweet
        }));
    }
}