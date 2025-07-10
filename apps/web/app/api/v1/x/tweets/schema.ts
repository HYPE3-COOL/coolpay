import { Tweetv2FieldsParams } from 'twitter-api-v2/dist/esm/types/v2/tweet.v2.types';
import { z } from 'zod';

export const createTweetSchema = z.object({
  text: z.string().min(1).max(4000),
  reply: z
    .object({
      in_reply_to_tweet_id: z.string(),
      exclude_reply_user_ids: z.array(z.string()).optional(),
    })
    .optional(),
  media: z
    .object({
      tagged_user_ids: z.array(z.string()).optional(),
      media_ids: z.union([
        z.tuple([z.string()]),
        z.tuple([z.string(), z.string()]),
        z.tuple([z.string(), z.string(), z.string()]),
        z.tuple([z.string(), z.string(), z.string(), z.string()]),
      ]),
    })
    .optional(),
  geo: z.object({ place_id: z.string() }).optional(),
  quote_tweet_id: z.string().optional(),
  pool: z.object({ duration_minutes: z.number(), options: z.array(z.string()) }).optional(),
});

export const replyTweetSchema = z.object({
  text: z.string().min(1).max(280),
  reply: z.object({
    in_reply_to_tweet_id: z.string(),
    exclude_reply_user_ids: z.array(z.string()).optional(),
  }),
  media: z
    .object({
      tagged_user_ids: z.array(z.string()).optional(),
      media_ids: z.union([
        z.tuple([z.string()]),
        z.tuple([z.string(), z.string()]),
        z.tuple([z.string(), z.string(), z.string()]),
        z.tuple([z.string(), z.string(), z.string(), z.string()]),
      ]),
    })
    .optional(),
  geo: z.object({ place_id: z.string() }).optional(),
  quote_tweet_id: z.string().optional(),
  pool: z.object({ duration_minutes: z.number(), options: z.array(z.string()) }).optional(),
});

export type CreateTweetDTO = z.input<typeof createTweetSchema>;
export type ReplyTweetDTO = z.input<typeof replyTweetSchema>;

export const fieldsParams: Tweetv2FieldsParams = {
  expansions: [
    // 'attachments.poll_ids',
    // 'attachments.media_keys',
    'author_id',
    'referenced_tweets.id',
    // 'in_reply_to_user_id',
    // 'edit_history_tweet_ids',
    'geo.place_id',
    'entities.mentions.username',
    'referenced_tweets.id.author_id',
  ],
  'media.fields': [
    'duration_ms',
    'height',
    'media_key',
    'preview_image_url',
    'type',
    'url',
    'width',
    'public_metrics',
    // 'non_public_metrics',
    // 'organic_metrics',
    'alt_text',
    'variants',
  ],
  'place.fields': [
    'contained_within',
    'country',
    'country_code',
    'full_name',
    'geo',
    'id',
    'name',
    'place_type',
  ],
  'poll.fields': ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status'],
  'tweet.fields': [
    'author_id',
    'created_at',
    'lang',
    'source',
    'possibly_sensitive',
    'conversation_id',
    'referenced_tweets',
    'public_metrics',
    'entities',
    'note_tweet',
  ],
  'user.fields': [
    'created_at',
    'description',
    'entities',
    'id',
    'location',
    'name',
    // 'pinned_tweet_id',
    'profile_image_url',
    'protected',
    'public_metrics',
    'url',
    'username',
    'verified',
    // 'verified_type',
    // 'withheld',
    // 'connection_status',
    // 'most_recent_tweet_id',
  ],
};
