import { db } from '@/db';
import { xTweet, XTweetSelect } from '@/db/schema/x';
import { desc } from 'drizzle-orm';

export class XTweetRepository {
    async getLatestXTweet(): Promise<XTweetSelect> {
        const [result] = await db.select()
            .from(xTweet)
            .orderBy(desc(xTweet.created_at))
            .limit(1)
            .execute();

        return result;
    }
}