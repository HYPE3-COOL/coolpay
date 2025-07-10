import { IBase } from "@/interfaces/base.interface";

export enum XTweetQueueType {
  Mentions = 'mentions',
  Replies = 'replies',
  Retweets = 'retweets',
  Likes = 'likes',
  Quotes = 'quotes',
}

export enum XTweetQueueStatus {
  Pending = 'pending',
  PaymentPending = 'payment_pending', // when payment is pending
  Processing = 'processing',
  Done = 'done',
  Failed = 'failed',
}

export enum XTweetQueueFailedReason {
  CreatorNotMentioned = 'creator_not_mentioned',
  IncompleteRequest = 'incomplete_request',
  // AuthorIdMissing = 'author_id_missing',
  NotRegistered = 'not_registered',
  WalletNotDelegated = 'wallet_not_delegated',
  LessThanMinimum = 'less_than_minimum', // e.g. less than 0.1 SOL
  InsufficientBalance = 'insufficient_balance',
  Other = 'other', // catch-all for any other reason
  Nil = '',
}

export interface IXTweetQueue extends IBase {
    id: number;
    tweet_id: number;
    type: XTweetQueueType; // e.g. 'mentions', 'replies', etc.
    status: XTweetQueueStatus;
    failed_reason?: XTweetQueueFailedReason; // reason for failure, if any
    amount?: string | number; // lamports, can be bigint or string
    meta?: object;
    created_at: string;
    updated_at: string;
}
