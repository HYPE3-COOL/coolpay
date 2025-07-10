import '@/app/polyfills';
/**
 * Cron job endpoint to fetch and process Twitter mentions for the platform's account.
 *
 * This handler performs the following steps:
 * 1. Fetches recent mentions of the platform's Twitter account using the Twitter API.
 * 2. Saves the fetched mention tweets into the database as `XTweet` records.
 * 3. Enqueues each mention tweet into the `xTweetQueue` queue for further analysis and classification.
 *
 * Authorization is required via a bearer token in the request header.
 * Responds with a summary of the operation or an error message.
 */
import type { NextRequest } from 'next/server';
import { AxiosError } from 'axios';
import { subDays } from 'date-fns';

import { env } from '@/env';
import { db } from '@/db';

import { XTweetInsert, xTweet } from '@/db/schema/x';
import { xTweetQueue } from '@/db/schema/x-tweet-queue';

import { getMentionsByUsername } from '@/utils/twitter-api';

import { MENTION_LOOKBACK_DAYS } from '@/constants/constant';
import { XTweetQueueFailedReason, XTweetQueueStatus, XTweetQueueType } from '@/interfaces';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const username = env.SITE_X_USERNAME;
        const latestTweet = await CoolPayService.getLatestXTweet();
        console.log(`Latest tweet for @${username}:`, latestTweet);
        let options = {};

        // check if the latest tweet is within the last 7 days, since we only want to fetch mentions for recent tweets
        if (latestTweet && latestTweet.created_at) {
            const tweetDate = new Date(latestTweet.created_at);
            const lookbackAgo = subDays(new Date(), MENTION_LOOKBACK_DAYS);
            if (tweetDate > lookbackAgo) {
                options = { since_id: latestTweet.id.toString() };
            }
        }

        const mentions = await getMentionsByUsername(username, options)
        if (mentions.length === 0) {
            return Response.json({ success: true, message: 'No new mentions found.' });
        }

        console.log(`Found ${mentions.length} new mentions for @${username}`);  

        // insert mentions as tweets into the database
        const replies: XTweetInsert[] = mentions.map((tweet: any) => ({
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
        await db.insert(xTweet).values(replies).onConflictDoNothing();

        
        // insert queue records for each mention tweet
        const now = new Date().toISOString();
        const queueRecords = replies.map((tweet) => ({
            tweet_id: BigInt(tweet.id),
            amount: BigInt(0), // Default amount, can be updated later
            type: XTweetQueueType.Mentions,
            status: XTweetQueueStatus.Pending,
            failed_reason: XTweetQueueFailedReason.Nil, // Default reason, can be updated later
            meta: {
                request_source: 'cron/mentions/platform',
                author_id: BigInt(tweet.author_id ?? ''),
            },
            created_at: tweet.created_at ?? now,
            updated_at: now,
        }));

        await db.insert(xTweetQueue).values(queueRecords).onConflictDoNothing();

        return Response.json({
            success: true,
        });

    } catch (e) {
        if (e instanceof AxiosError) {
            console.error(e.response?.data);
        }
        return Response.json({ success: false, error: JSON.stringify(e) }, { status: 500 });
    }

}
