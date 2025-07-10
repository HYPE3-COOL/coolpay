import { db } from '@/db';
import { xTweet } from '@/db/schema/x';
import { IxTweet } from '@/interfaces/x-tweet.interface';
import { eq, and, ne, inArray } from 'drizzle-orm';

export class XTweetService {
  static async getById(id: number | bigint | string) {
    const [result] = await db.select().from(xTweet).where(eq(xTweet.id, BigInt(id)));
    return result;
  }

  static async list(filter?: {
    author_id?: number | bigint | string;
    conversation_id?: number | bigint | string;
    lang?: string;
  }) {
    let whereClause = undefined;
    if (filter) {
      const clauses = [];
      if (filter.author_id !== undefined) clauses.push(eq(xTweet.author_id, BigInt(filter.author_id)));
      if (filter.conversation_id !== undefined) clauses.push(eq(xTweet.conversation_id, BigInt(filter.conversation_id)));
      if (filter.lang) clauses.push(eq(xTweet.lang, filter.lang));
      if (clauses.length > 0) whereClause = and(...clauses);
    }
    return await db.select().from(xTweet).where(whereClause);
  }

  static async getReplies(tweetId: number | bigint | string) {
    return await db.select()
      .from(xTweet)
      .where(and(
        eq(xTweet.conversation_id, BigInt(tweetId)),
        ne(xTweet.id, xTweet.conversation_id)
      ));
  }

  static async getByIds(ids: Array<number | bigint | string>) {
    if (!ids.length) return [];
    const bigIntIds = ids.map(id => BigInt(id));
    return await db.select().from(xTweet).where(inArray(xTweet.id, bigIntIds));
  }
}
