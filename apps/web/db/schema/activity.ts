import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { schema } from '../common';
import { ActivityStatus } from '@/interfaces';

export const activity = schema.table(
  'activities',
  {
    id: bigint('id', { mode: 'bigint' })
      .primaryKey()
      .notNull()
      .generatedAlwaysAsIdentity(),
    user_id: bigint('user_id', { mode: 'bigint' }).notNull(), // references user.id
    creator_id: bigint('creator_id', { mode: 'bigint' }).notNull(), // references user.id
    x_tweet_id: bigint('x_tweet_id', { mode: 'bigint' }).notNull(), // references x_tweet.id
    amount: bigint('amount', { mode: 'bigint' }), // lamports
    fee: bigint('fee', { mode: 'bigint' }), // lamports
    amountAfterFee: bigint('amount_after_fee', { mode: 'bigint' }), // lamports
    token: varchar('token', { length: 16 }).notNull().default('SOL'),
    status: varchar('status', { length: 20 }).notNull().default(ActivityStatus.Pending), // e.g. 'pending', 'processing', 'rejected', 'failed', 'succeeded'
    response_count: integer('response_count').notNull().default(0),
    is_responsed: boolean('is_responsed').notNull().default(false),
    is_live: boolean('is_live').notNull().default(true),
    meta: jsonb('meta'),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(), // when the activity was created
    started_at: timestamp('started_at', { mode: 'string', withTimezone: true }),      // when the activity started (=processing)
    ended_at: timestamp('ended_at', { mode: 'string', withTimezone: true }),     // when the activity ended (=succeeded or failed)
    payment_status: varchar('payment_status', { length: 20 }).notNull(), // funded | paid | refunded
    first_reply_tweet_id: bigint('first_reply_tweet_id', { mode: 'bigint' }), // the first reply tweet id, if any
    fund_hash: varchar('fund_hash', { length: 100 }),
    refund_hash: varchar('refund_hash', { length: 100 }),
    paid_hash: varchar('paid_hash', { length: 100 }),
  },
  (table) => [
    index('activities_user_id_idx').on(table.user_id),
    index('activities_creator_id_idx').on(table.creator_id),
    index('activities_x_tweet_id_idx').on(table.x_tweet_id),
  ]
);

export type ActivityInsert = typeof activity.$inferInsert;
export type ActivitySelect = typeof activity.$inferSelect;
