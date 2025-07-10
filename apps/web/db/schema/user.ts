import {
    bigint,
    boolean,
    jsonb,
    integer,
    timestamp,
    uniqueIndex,
    varchar,
    doublePrecision,
} from 'drizzle-orm/pg-core';

import { UserV2 } from 'twitter-api-v2';
import { schema } from '../common';

// Extend the base table for the user table
export const user = schema.table(
    'user',
    {
        id: bigint('id', { mode: 'bigint' }).primaryKey().notNull().generatedAlwaysAsIdentity(),
        privy_user_id: varchar('privy_user_id', { length: 50 }).notNull(),
        twitter_id: bigint('twitter_id', { mode: 'bigint' }).notNull(),
        username: varchar('username', { length: 30 }).notNull(),        // twitter username
        image: varchar('image', { length: 255 }).notNull(),
        privy_wallet_id: varchar('privy_wallet_id', { length: 50 }).notNull(),
        privy_wallet_address: varchar('privy_wallet_address', { length: 100 }).notNull(),
        linked_accounts: jsonb('linked_accounts'),
        twitter: jsonb('twitter'),
        is_new_user: boolean('is_new_user').notNull().default(false),
        is_creator: boolean('is_creator').notNull().default(false),
        is_admin: boolean('is_admin').notNull().default(false),
        no_of_requests: integer('no_of_requests').notNull().default(0),
        no_of_followers: integer('no_of_followers').notNull().default(0),
        success_rate: doublePrecision('success_rate').notNull().default(0),
        avg_cost: bigint('avg_cost', { mode: 'bigint' }).notNull(),
        public_metrics: jsonb('public_metrics').$type<UserV2['public_metrics']>(),
        created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('user_privy_user_id_idx').on(table.privy_user_id),
        uniqueIndex('user_username_idx').on(table.username),
        uniqueIndex('user_twitter_id_idx').on(table.twitter_id),
    ]
);

export type UserInsert = typeof user.$inferInsert;
export type UserSelect = typeof user.$inferSelect;

// Only public fields
export type UserPublicSelect = Pick<
  UserSelect,
  'no_of_requests' | 'no_of_followers' | 'success_rate' | 'avg_cost' | 'username' | 'image' | 'twitter'
>;