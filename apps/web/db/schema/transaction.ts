import {
  bigint,
  varchar,
  jsonb,
  timestamp,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { schema } from '../common';
import { TransactionStatus, TransactionType } from '@/interfaces';

export const transaction = schema.table(
  'transaction',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
    hash: varchar('hash', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull().default(TransactionType.Deposited), // e.g. 'deposit', 'withdraw', 'transfer'
    user_id: bigint('user_id', { mode: 'bigint' }).notNull(),   // deprecated, use from_address or to_address instead to join the user table
    x_tweet_id: bigint('x_tweet_id', { mode: 'bigint' }), // related to x_tweet table, if applicable
    from_address: varchar('from_address', { length: 100 }),
    to_address: varchar('to_address', { length: 100 }),
    amount: bigint('amount', { mode: 'bigint' }), // lamports
    status: varchar('status', { length: 20 }).notNull().default(TransactionStatus.Pending), // e.g. 'pending', 'confirmed', 'failed'
    meta: jsonb('meta'), // for any extra info
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('transactions_hash_idx').on(table.hash),
    index('transactions_from_address_idx').on(table.from_address),
    index('transactions_to_address_idx').on(table.to_address),
  ]
);

export type TransactionInsert = typeof transaction.$inferInsert;
export type TransactionSelect = typeof transaction.$inferSelect;
