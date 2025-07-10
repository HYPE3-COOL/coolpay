import '@/app/polyfills';
import type { NextRequest } from 'next/server';
import { AxiosError } from 'axios';
import { desc, eq, and, ne } from 'drizzle-orm';

import { env } from '@/env';
import { XTweetInsert, xTweet } from '@/db/schema/x';
import { db } from '@/db';

import { getRepliesByTweetId } from '@/utils/twitter-api';

import { ActivityStatus } from '@/interfaces/activity.interface';

import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 1. Get all activities that are still lived (is_lived = true) and status is 'processing'
        const posts = await CoolPayService.getActivities({
            status: ActivityStatus.Processing,
            is_live: true
        });
        
        let totalRepliesFetched = 0;
        for (const post of posts) {
            // Get the latest reply for this post (id != conversation_id)
            const postId = post.x_tweet_id.toString();
            const latestReplies = await db.select({ id: xTweet.id })
                .from(xTweet)
                .where(and(
                    eq(xTweet.conversation_id, BigInt(postId)),
                    ne(xTweet.id, xTweet.conversation_id)
                ))
                .orderBy(desc(xTweet.created_at))
                .limit(1)
                .execute();

            const sinceId = latestReplies.length > 0 ? latestReplies[0].id.toString() : undefined;
            console.log(`Post ID: ${postId}, Latest Reply ID: ${sinceId}`);
            
            // 3. Fetch new replies
            const options = sinceId ? { since_id: sinceId } : {};
            const replies = await getRepliesByTweetId(postId.toString(), options);
            totalRepliesFetched += replies.length;

            console.log(`Fetched ${replies.length} new replies for post ID: ${postId}`);

            // 4. Insert new replies into the database
            if (replies.length > 0) {
                const tweets: XTweetInsert[] = replies.map((tweet: any) => ({
                    id: BigInt(tweet.id),
                    author_id: BigInt(tweet.author_id ?? ''),
                    text: tweet.text,
                    created_at: tweet.created_at ?? '',
                    lang: tweet.lang ?? null,
                    source: tweet.source ?? null,
                    possibly_sensitive: tweet.possibly_sensitive ?? false,
                    conversation_id: tweet.conversation_id ? BigInt(tweet.conversation_id) : null,
                    referenced_tweets: tweet.referenced_tweets || null,
                    public_metrics: tweet?.public_metrics || null,
                    entities: tweet?.entities || null,
                    note_tweet: tweet?.note_tweet || null,
                }));
                await db.insert(xTweet).values(tweets).onConflictDoNothing();
            }
        }
        return Response.json({
            success: true,
            message: `Fetched ${totalRepliesFetched} replies for all posts and stored them in the database.`,
        });

    } catch (e) {
        if (e instanceof AxiosError) {
            console.error(e.response?.data);
        }
        return Response.json({ success: false, error: e });
    }

}
