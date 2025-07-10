import { TwitterApi, UserV2 } from 'twitter-api-v2';
// import { HttpsProxyAgent } from 'https-proxy-agent';
import { env } from '../env';

// const httpAgent = new HttpsProxyAgent('http://localhost:7890');
// export const xAPI = new TwitterApi(env.X_API_KEY, env.FUCK_GFW ? { httpAgent } : undefined);
export const xAPI = new TwitterApi(env.X_API_KEY);

type XUser = UserV2 & {
  profile_image_url: string;
  created_at: string;
  verified: boolean;
  protected: boolean;
  url: string;
  description: string;
  public_metrics: UserV2['public_metrics'];
  entities: UserV2['entities'];
};

export async function usersByUsernames(usernames: string[]): Promise<XUser[]> {
  const result = await xAPI.v2.usersByUsernames(usernames, {
    'user.fields': [
      'id',
      'name',
      'username',
      'profile_image_url',
      'created_at',
      'verified',
      'protected',
      'url',
      'description',
      'public_metrics',
      'entities',
    ],
  });
  const users = result.data as XUser[];
  // console.table(users.map((u) => ({ id: u.id, username: u.username })));
  return users;
}

export async function userByUsername(username: string): Promise<XUser | undefined> {
  const users = await usersByUsernames([username]);
  return users[0];
}

/**
 * The recent search endpoint returns Tweets from the last 7 days that match a search query.
 * https://developer.x.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
 */
export async function getMentionsByUsername(username: string, options?: { since_id?: string }) {
  try {

    const query = `@${username}`; // Search for tweets mentioning the username
    const response = await xAPI.v2.search(query, {
      max_results: 100,
      ...(options?.since_id ? { since_id: options.since_id } : {}),
      'tweet.fields': [
        'attachments',
        'author_id',
        'context_annotations',
        'conversation_id',
        'created_at',
        'entities',
        'geo',
        'id',
        'in_reply_to_user_id',
        'lang',
        'public_metrics',
        'possibly_sensitive',
        'referenced_tweets',
        'reply_settings',
        'source',
        'text',
        'withheld',
        'note_tweet'
      ],
    });

    return response.data?.data || [];

  } catch (error) {
    console.error('Error fetching mentions:', error);
    return [];
  }

}

/**
 * Get replies to a specific tweet by tweetId.
 * This searches for tweets that are replies to the given tweet.
 */
export async function getRepliesByTweetId(tweetId: string, options?: { since_id?: string }) {
  try {
    // The query filters for tweets that are replies to the given tweetId
    // const query = `conversation_id:${tweetId} -from:me`;  // Exclude replies from the authenticated user (if needed)
    const query = `conversation_id:${tweetId}`;
    const response = await xAPI.v2.search(query, {
      max_results: 100,
      ...(options?.since_id ? { since_id: options.since_id } : {}),
      'tweet.fields': [
        'attachments',
        'author_id',
        'context_annotations',
        'conversation_id',
        'created_at',
        'entities',
        'geo',
        'id',
        'in_reply_to_user_id',
        'lang',
        'public_metrics',
        'possibly_sensitive',
        'referenced_tweets',
        'reply_settings',
        'source',
        'text',
        'withheld',
        'note_tweet'
      ],
    });

    // Filter to only direct replies to the tweetId
    const replies = (response.data?.data || []).filter(
      (tweet: any) => tweet.in_reply_to_user_id && tweet.referenced_tweets?.some((ref: any) => ref.type === 'replied_to' && ref.id === tweetId)
    );

    return replies;
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
}

export async function getTwitterClient() {
  return new TwitterApi({
    appKey: env.X2_API_KEY,
    appSecret: env.X2_API_KEY_SECRET,
    accessToken: env.X2_ACCESS_TOKEN,
    accessSecret: env.X2_ACCESS_TOKEN_SECRET,
  })
}

export async function replyToTweet(message: string, tweetId: string) {
  try {
    const client = await getTwitterClient();
    const response = await client.v2.reply(message, tweetId);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function sendWarning(message: string, tweetId: string) {
  try {
    console.log(`Replying to tweet ${tweetId} with message: ${message} at ${new Date().toISOString()}`);
    await replyToTweet(message, tweetId);
  } catch (err) {
    console.error(`Failed to send message ${tweetId}:`, err);
  }
}