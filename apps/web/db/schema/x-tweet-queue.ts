import {
  bigint,
  index,
  jsonb,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../common';
import { XTweetQueueFailedReason, XTweetQueueStatus, XTweetQueueType } from '@/interfaces';

export const xTweetQueue = schema.table(
  'x_tweet_queue',
  {
    id: bigint('id', { mode: 'bigint' })
      .primaryKey()
      .notNull()
      .generatedAlwaysAsIdentity(),
    tweet_id: bigint('tweet_id', { mode: 'bigint' }).notNull(),
    type: varchar('type', { length: 32 }).notNull().default(XTweetQueueType.Mentions),
    status: varchar('status', { length: 20 }).notNull().default(XTweetQueueStatus.Pending),
    failed_reason: varchar('failed_reason', { length: 50 }).notNull().default(XTweetQueueFailedReason.Nil), // reason for failure, if any
    amount: bigint('amount', { mode: 'bigint' }), // lamports
    meta: jsonb('meta'), // for any extra info
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('x_tweet_queue_tweet_id_idx').on(table.tweet_id),
    index('x_tweet_queue_type_idx').on(table.type),
    index('x_tweet_queue_status_idx').on(table.status),
  ]
);

export type XTweetQueueInsert = typeof xTweetQueue.$inferInsert;
export type XTweetQueueSelect = typeof xTweetQueue.$inferSelect;
