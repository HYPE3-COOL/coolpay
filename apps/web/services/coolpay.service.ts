import { eq, and } from 'drizzle-orm';
import { db } from "@/db";
import { xTweet, transaction, activity, user, xTweetQueue, XTweetQueueInsert, UserInsert, TransactionInsert, TransactionSelect, ActivityInsert } from "@/db/schema";
import { ActivityPaymentStatus, ActivityStatus, TransactionStatus, TransactionType, XTweetQueueFailedReason, XTweetQueueStatus, XTweetQueueType } from "@/interfaces";
import { IPaginationOptions, ICreateTransactionAndActivity } from "@/interfaces/base.interface";

import {
    UserRepository,
    ActivityRepository,
    TransactionRepository,
    XTweetRepository,
    XTweetQueueRepository,
    IActivityFilter,
    IUserFilter,
    ITransactionFilter,
    IXTweetQueueFilter,
} from "@/repositories";
import { User as PrivyUser } from '@privy-io/server-auth';

import { env } from '@/env';


const userRepo = new UserRepository();
const activityRepo = new ActivityRepository();
const xTweetRepo = new XTweetRepository();
const xTweetQueueRepo = new XTweetQueueRepository();
const transactionRepo = new TransactionRepository();

export const CoolPayService = {
    getUserById: async (id: number | string | bigint) => {
        return await userRepo.getById(id);
    },
    getUserByPrivyId: async (privyUserId: string) => {
        return await userRepo.getByPrivyId(privyUserId);
    },
    getUserByTwitterId: async (twitterUserId: bigint) => {
        return await userRepo.getByTwitterId(twitterUserId);
    },
    getUserByUsername: async (username: string) => {
        return await userRepo.getByUsername(username);
    },
    getUserByWalletAddress: async (walletAddress: string) => {
        return await userRepo.getByWalletAddress(walletAddress);
    },

    getUsers: async (
        filter?: IUserFilter,
        options?: IPaginationOptions
    ) => {
        return await userRepo.list(filter, options);
    },

    getUserWallets: async () => {
        return await userRepo.getUserWallets();
    },

    countUsers: async (filter?: IUserFilter) => {
        return await userRepo.count(filter);
    },

    findOrCreateUser: async (data: PrivyUser, options?: { is_new_user?: boolean; is_creator?: boolean; is_admin?: boolean }) => {
        return await userRepo.findOrCreate(data, options);
    },

    updateUserByPrivyId: async (privyUserId: string, data: Partial<UserInsert>) => {
        return await userRepo.updateByPrivyId(privyUserId, data);
    },

    updateUserByTwitterId: async (twitterId: bigint, data: Partial<UserInsert>) => {
        return await userRepo.updateByTwitterId(twitterId, data);
    },

    getActivities: async (
        filter?: IActivityFilter,
        options?: IPaginationOptions
    ) => {
        return await activityRepo.listWithJoin(filter, options);
    },
    countActivities: async (filter?: IActivityFilter) => {
        return await activityRepo.count(filter);
    },
    getActivityByTweetId: async (x_tweet_id: bigint) => {
        return await activityRepo.getByTweetId(x_tweet_id);
    },
    getActiveActivities: async () => {
        return await activityRepo.listWithJoin({ status: ActivityStatus.Processing });
    },
    getLiveActivitiesOtherThanProcessing: async () => {
        return await activityRepo.listWithJoin({ is_live: true })
            .then(activities => activities.filter(activity => activity.status !== ActivityStatus.Processing));
    },
    updateActivityById: async (id: bigint, data: Partial<ActivityInsert>) => {
        return await activityRepo.updateById(id, data);
    },
    updateActivityByTweetId: async (x_tweet_id: bigint, data: Partial<ActivityInsert>) => {
        return await activityRepo.updateByTweetId(x_tweet_id, data);
    },

    getLatestXTweet: async () => {
        return await xTweetRepo.getLatestXTweet();
    },
    getTransactionByHash: async (hash: string) => {
        return await transactionRepo.getByHash(hash);
    },

    getXTweetQueueByTweetId: async (x_tweet_id: bigint) => {
        return await xTweetQueueRepo.getByTweetId(x_tweet_id);
    },

    updateXTweetQueueById: async (id: bigint, data: Partial<XTweetQueueInsert>) => {
        return await xTweetQueueRepo.updateById(id, data);
    },
    updateXTweetQueueByTweetId: async (x_tweet_id: bigint, data: Partial<XTweetQueueInsert>) => {
        return await xTweetQueueRepo.updateByTweetId(x_tweet_id, data);
    },

    updateXTweetQueueNotRegistered: async (id: bigint) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.NotRegistered,
        });
    },
    updateXTweetQueueWalletNotDelegated: async (id: bigint) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.WalletNotDelegated,
        });
    },
    updateXTweetQueueLessThanMinimum: async (id: bigint) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.LessThanMinimum,
        });
    },
    updateXTweetQueueInsufficientBalance: async (id: bigint) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.InsufficientBalance,
        });
    },
    updateXTweetQueueCreatorNotMentioned: async (id: bigint) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.CreatorNotMentioned,
        });
    },
    updateXTweetQueueIncompleteRequest: async (id: bigint, meta?: any) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.IncompleteRequest,
            meta,
        });
    },
    updateXTweetQueueOther: async (id: bigint, data: Partial<XTweetQueueInsert>) => {
        return await xTweetQueueRepo.updateById(id, {
            status: XTweetQueueStatus.Failed,
            failed_reason: XTweetQueueFailedReason.Other,
            meta: data.meta,
        });
    },

    getPendingMention: async () => {
        return await db
            .select({ queue: xTweetQueue, tweet: xTweet })
            .from(xTweetQueue)
            .innerJoin(xTweet, eq(xTweetQueue.tweet_id, xTweet.id))
            .where(
                and(
                    eq(xTweetQueue.status, XTweetQueueStatus.Pending),
                    eq(xTweetQueue.type, XTweetQueueType.Mentions),
                )
            );
    },

    createTransactionAndActivity: async (data: ICreateTransactionAndActivity) => {
        const now = new Date().toISOString();
        const end = new Date(Date.now() + env.MONITOR_DURATION * 60 * 60 * 1000).toISOString();
        const tweetId = data.x_tweet_id !== undefined ? BigInt(data.x_tweet_id) : BigInt(0);
        const lamportAmount = data.amount !== undefined ? BigInt(data.amount) : BigInt(0);

        await db.transaction(async (trx) => {
            const [transactionResult] = await trx.insert(transaction).values({
                hash: data.hash,
                type: TransactionType.Paid,
                status: TransactionStatus.Pending,
                x_tweet_id: tweetId,
                from_address: data.from_address,
                to_address: data.to_address,
                amount: lamportAmount,
                meta: {
                    request_source: 'cron/action',
                    cluster: data.cluster,
                },
                user_id: BigInt(0),
            }).returning();

            const [activityResult] = await trx.insert(activity).values({
                user_id: BigInt(data.user_twitter_id),
                creator_id: BigInt(data.creator_twitter_id),
                x_tweet_id: tweetId,
                amount: lamportAmount,
                fee: BigInt(0),
                amountAfterFee: lamportAmount,
                started_at: now.toString(),     // when the activity started (=processing)
                ended_at: end.toString(),       // when the activity ended (=succeeded or failed)
                status: ActivityStatus.Pending,
                payment_status: ActivityPaymentStatus.Funded,
                fund_hash: data.hash,
                meta: {
                    request_source: 'cron/action',
                    cluster: data.cluster,
                    tx_hash: data.hash,
                },
            }).returning();

            const [xTweetQueueResult] = await trx.update(xTweetQueue)
                .set({
                    status: XTweetQueueStatus.PaymentPending,
                    amount: lamportAmount,
                    meta: {
                        request_source: 'cron/action',
                        cluster: data.cluster,
                        tx_hash: data.hash,
                    }
                })
                .where(eq(xTweetQueue.id, BigInt(data.x_tweet_queue_id)))
                .returning();
        });
    },

    getTransactions: async (
        filter?: ITransactionFilter,
        options?: IPaginationOptions
    ) => {
        return await transactionRepo.list(filter, options);
    },

    countTransactions: async (filter?: ITransactionFilter) => {
        return await transactionRepo.count(filter);
    },

    getLatestConfirmedTransactionByAddress: async (address: string) => {
        return await transactionRepo.getLatestConfirmedTransactionByAddress(address);
    },
    calculateTransactionFee: (amount: number, type: TransactionType): number => {
        return transactionRepo.calculateFee(amount, type);
    },
    createTransaction: async (data: TransactionInsert): Promise<TransactionSelect | undefined> => {
        return await transactionRepo.create(data);
    },
    createManyTransactions: async (data: TransactionInsert[]): Promise<TransactionSelect[]> => {
        return await transactionRepo.createMany(data);
    },
    // updateTransactionStatus: async (hash: string, status: TransactionStatus): Promise<void> => {
    //     return await transactionRepo.updateTransactionStatus(hash, status);
    // },
    updateTransactionByHash: async (hash: string, data: Partial<TransactionInsert>): Promise<TransactionSelect | undefined> => {
        return await transactionRepo.updateByHash(hash, data);
    },

    getXTweetQueues: async (
        filter?: IXTweetQueueFilter,
        options?: IPaginationOptions
    ) => {
        return await xTweetQueueRepo.list(filter, options);
    },
    countXTweetQueues: async (filter?: IXTweetQueueFilter) => {
        return await xTweetQueueRepo.count(filter);
    },

};

