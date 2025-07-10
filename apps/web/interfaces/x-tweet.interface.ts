import { UserV2, ReferencedTweetV2, TweetEntitiesV2, TweetPublicMetricsV2, ApiV2Includes, NoteTweetV2 } from "twitter-api-v2";

export interface IxTweet {
	id: string; // bigint in DB, represented as string
	author_id: string; // bigint in DB, represented as string
	text: string;
	created_at: string; // timestamp with timezone
	lang: string | null;
	source: string | null;
	possibly_sensitive: boolean | null;
	conversation_id: string | null; // bigint in DB, represented as string
	referenced_tweets: ReferencedTweetV2[] | null;
	public_metrics: TweetPublicMetricsV2 | null;
	entities: TweetEntitiesV2 | null;
	includes: ApiV2Includes | null;
	note_tweet: NoteTweetV2 | null;
}
