import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { xTweet } from '@/db/schema/x';
import { eq, and, ne } from 'drizzle-orm';

import { ActivityPaymentStatus, ActivityStatus, TransactionStatus, TransactionType, XTweetQueueStatus, XTweetQueueType } from '@/interfaces';

import { env } from '@/env';
import { transfer } from '@/services/server/event';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TRANSACTION_FEE } from '@/constants/constant';

import { PrivyService } from '@/services/privy.service';
import { sendWarning } from '@/utils/twitter-api';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const cluster = env.SOLANA_ENV!;
    const activities = await CoolPayService.getActiveActivities(); // Get all active activities
    const platformPrivy = await PrivyService.getUserById(env.SITE_PRIVY_ID!);

    // count the replies for each activity, ignoring the original tweet itself 
    for (const activity of activities) {
        const replyCount = await db.select()
            .from(xTweet)
            .where(and(
                eq(xTweet.author_id, activity.creator_id),          // replies from the creator requested in the activity
                eq(xTweet.conversation_id, activity.x_tweet_id),        // meaning replies to this activity
                ne(xTweet.id, xTweet.conversation_id)
            ))
            .orderBy(xTweet.id);

        if (replyCount.length > 0) {        // if there is any replies, update the activity status to succeeded
            await CoolPayService.updateActivityById(activity.id, {
                response_count: replyCount.length,
                is_responsed: true,
                first_reply_tweet_id: replyCount[0].id, // the first reply tweet id
                status: ActivityStatus.Succeeded,
            });

            const creator = await CoolPayService.getUserByTwitterId(activity.creator_id);
            if (!creator) {
                console.error(`Creator not found for activity ${activity.id}`);
                continue;
            }

            const creatorPrivy = await PrivyService.getUserById(creator.privy_user_id);
            if (activity.amount && creatorPrivy?.wallet?.address && platformPrivy?.wallet?.id) {
                try {
                    const amountInDecimal = Number(activity.amount) / LAMPORTS_PER_SOL;
                    const fee = CoolPayService.calculateTransactionFee(amountInDecimal, TransactionType.Received)
                    const { success, txHash, blockhash } = await transfer({
                        cluster,
                        fromAddress: env.SITE_PRIVY_WALLET!,
                        toAddress: creatorPrivy?.wallet?.address,
                        token: 'SOL',
                        amount: amountInDecimal - fee,
                        fee: 0,     // already deducted from the amount as fee for the transaction to the platform
                        walletId: platformPrivy?.wallet?.id,
                    });

                    const creatorWalletAddress = creatorPrivy?.wallet?.address || '';
                    if (success && txHash) {
                        const user = await CoolPayService.getUserByPrivyId(creatorPrivy.id);
                        const now = new Date().toISOString();

                        // Convert fee (decimal SOL) to lamports (bigint) to match activity.amount
                        const feeInLamports = BigInt(Math.round(fee * LAMPORTS_PER_SOL));
                        const amountAfterFee = (BigInt(activity.amount) - feeInLamports).toString();

                        await CoolPayService.createTransaction({
                            hash: txHash,
                            type: TransactionType.Received,
                            status: TransactionStatus.Pending,
                            user_id: BigInt(user?.id ?? 0),
                            x_tweet_id: activity.x_tweet_id,
                            from_address: env.SITE_PRIVY_WALLET!,
                            to_address: creatorWalletAddress,
                            amount: (BigInt(activity.amount) - feeInLamports),
                            meta: {
                                request_source: 'cron/stat',
                                creator_privy_user_id: creatorPrivy.id,
                                amount: amountInDecimal.toString(),
                                fee: fee,
                            }
                        });

                    } else {
                        await CoolPayService.updateActivityById(activity.id, {
                            status: ActivityStatus.Failed,
                            meta: {
                                request_source: 'cron/stat',
                                type: 'received',
                                txHash: txHash ?? '',
                                toAddress: creatorWalletAddress,
                                fromAddress: env.SITE_PRIVY_WALLET,
                            }
                        });

                        const message = `⛔ Failed to process your request. Please try again later.`;
                        await sendWarning(message, activity.x_tweet_id.toString());
                    }
                } catch (error) {
                    await CoolPayService.updateActivityById(activity.id, {
                        status: ActivityStatus.Failed,
                        meta: {
                            request_source: 'cron/stat',
                            type: 'received',
                            error: JSON.stringify(error),
                        }
                    });

                    const message = `⛔ Failed to process your request. Please try again later.`;
                    await sendWarning(message, activity.x_tweet_id.toString());
                    continue;
                }
            }
        } else {
            const now = new Date();
            if (activity.ended_at && new Date(activity.ended_at) < now) {

                const user = await CoolPayService.getUserByTwitterId(activity.user_id);
                if (!user) {
                    console.error(`User not found for activity ${activity.id}`);
                    continue;
                }

                const userPrivy = await PrivyService.getUserById(user.privy_user_id);

                if (activity.amount && userPrivy?.wallet?.address && platformPrivy?.wallet?.id) {
                    const amountInDecimal = Number(activity.amount) / LAMPORTS_PER_SOL;
                    const fee = CoolPayService.calculateTransactionFee(amountInDecimal, TransactionType.Refunded)

                    // special case
                    if (amountInDecimal - fee <= 0) {
                        console.error(`Failed to transfer amount for activity ${activity.id}`);
                        await CoolPayService.updateActivityById(activity.id, {
                            status: ActivityStatus.Failed,
                            is_live: false,
                            meta: {
                                request_source: 'cron/stat',
                                type: 'refund',
                                error: 'Amount after fee is less than or equal to zero',
                                amount: activity.amount.toString(),
                                toAddress: userPrivy?.wallet.address,
                                fromAddress: env.SITE_PRIVY_WALLET,
                                token: 'SOL',
                                fee: TRANSACTION_FEE,
                            }
                        });
                    }

                    try {
                        const { success, txHash, blockhash } = await transfer({
                            cluster,
                            fromAddress: env.SITE_PRIVY_WALLET!,
                            toAddress: userPrivy?.wallet?.address,
                            token: 'SOL',
                            amount: amountInDecimal - fee,
                            fee: 0,  // already deducted from the amount as fee for the transaction to the platform
                            walletId: platformPrivy?.wallet?.id,
                        });

                        const userWalletAddress = userPrivy?.wallet?.address || '';
                        if (success && txHash) {
                            const feeInLamports = BigInt(Math.round(fee * LAMPORTS_PER_SOL));
                            const amountAfterFee = (BigInt(activity.amount) - feeInLamports).toString();

                            await CoolPayService.createTransaction({
                                hash: txHash,
                                type: TransactionType.Refunded,
                                status: TransactionStatus.Pending,
                                user_id: BigInt(user?.id ?? 0),
                                x_tweet_id: activity.x_tweet_id,
                                from_address: env.SITE_PRIVY_WALLET!,
                                to_address: userWalletAddress,
                                amount: (BigInt(activity.amount) - feeInLamports),
                                meta: {
                                    request_source: 'cron/stat',
                                    user_privy_user_id: user?.privy_user_id,
                                    amount: amountInDecimal.toString(),
                                    fee: fee,
                                },
                            });

                        } else {
                            console.error(`Failed to transfer amount for activity ${activity.id}: ${txHash}`);
                            await CoolPayService.updateActivityById(activity.id, {
                                status: ActivityStatus.Failed,
                                is_live: false
                            });
                        }
                    } catch (error) {
                        await CoolPayService.updateActivityById(activity.id, {
                            status: ActivityStatus.Failed,
                            meta: {
                                request_source: 'cron/stat',
                                type: 'expired',
                                error: JSON.stringify(error),
                            }
                        });

                        const message = `⛔ Failed to process your request. Please try again later.`;
                        await sendWarning(message, activity.x_tweet_id.toString());
                        continue;
                    }
                }
            }
        }
    }

    const liveActivities = await CoolPayService.getLiveActivitiesOtherThanProcessing();
    for (const activity of liveActivities) {
        if (activity.is_live && activity.ended_at && new Date(activity.ended_at) < new Date()) {
            await CoolPayService.updateActivityById(activity.id, {
                is_live: false
            });
        }
    }
    return Response.json({ status: 'success', count: activities.length });
}