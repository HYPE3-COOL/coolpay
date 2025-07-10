import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  varchar,
  vector,
} from 'drizzle-orm/pg-core';
import {
  ApiV2Includes,
  NoteTweetV2,
  ReferencedTweetV2,
  TweetEntitiesV2,
  TweetPublicMetricsV2,
  UserV2,
} from 'twitter-api-v2';
import { schema } from '../common';

export const xUser = schema.table(
  'x_user',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey().notNull(),      // twitter user ID
    name: varchar('name', { length: 50 }).notNull(),
    username: varchar('username', { length: 30 }).notNull(),
    profile_image_url: varchar('profile_image_url', { length: 128 }).notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull(),
    verified: boolean('verified'),
    protected: boolean('protected'),
    url: varchar('url', { length: 100 }),
    location: varchar('location', { length: 100 }),
    description: varchar('description', { length: 256 }),
    public_metrics: jsonb('public_metrics').$type<UserV2['public_metrics']>(),
    entities: jsonb('entities').$type<UserV2['entities']>(),
  },
  (table) => [
    uniqueIndex('x_user_username_idx').on(table.username),
    index('x_user_created_at_idx').on(table.created_at),
  ]
);

export const xTweet = schema.table(
  'x_tweet',
  {
    id: bigint('id', { mode: 'bigint' }).primaryKey().notNull(),
    // author_id: bigint('author_id', { mode: 'bigint' })
    //   .references(() => xUser.id)
    //   .notNull(),
    author_id: bigint('author_id', { mode: 'bigint' }), // removed .references()
    text: varchar('text', { length: 4000 }).notNull(),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull(),
    lang: varchar('lang', { length: 35 }),
    source: varchar('source', { length: 32 }),
    possibly_sensitive: boolean('possibly_sensitive'),
    // The Tweet ID of the original Tweet of the conversation (which includes direct replies,
    // replies of replies). Use this to reconstruct the conversation from a Tweet.
    conversation_id: bigint('conversation_id', { mode: 'bigint' }),   // this is the original tweet ID
    referenced_tweets: jsonb('referenced_tweets').$type<ReferencedTweetV2[]>(),
    public_metrics: jsonb('public_metrics').$type<TweetPublicMetricsV2>(),
    entities: jsonb('entities').$type<TweetEntitiesV2>(),
    includes: jsonb('includes').$type<ApiV2Includes>(),
    note_tweet: jsonb('note_tweet').$type<NoteTweetV2>(),
  },
  (table) => [
    index('x_tweet_author_id_idx').on(table.author_id),
    index('x_tweet_created_at_idx').on(table.created_at),
  ]
);

export type XUserInsert = typeof xUser.$inferInsert;
export type XUserSelect = typeof xUser.$inferSelect;

export type XTweetInsert = typeof xTweet.$inferInsert;
export type XTweetSelect = typeof xTweet.$inferSelect;
