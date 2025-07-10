// import { asc } from 'drizzle-orm';
// import { HttpsProxyAgent } from 'https-proxy-agent';
import { TwitterApi } from 'twitter-api-v2';
// import { db } from '@/db';
// import { xOAuth2Token } from '@/db/schema/x';
import { env } from '@/env';

// const proxy = new HttpsProxyAgent('http://localhost:7890');

// export async function getXApiClient() {
//   const [token] = await db
//     .select({ accessToken: xOAuth2Token.access_token })
//     .from(xOAuth2Token)
//     .orderBy(asc(xOAuth2Token.created_at))
//     .limit(1);

//   if (!token) throw new Error('No token found');

//   return new TwitterApi(token.accessToken, 
//     // { httpAgent: env.FUCK_GFW ? proxy : undefined }
//   );  
// }

export async function getTwitterClient() {
  return new TwitterApi({
    appKey: env.X2_API_KEY,
    appSecret: env.X2_API_KEY_SECRET,
    accessToken: env.X2_ACCESS_TOKEN,
    accessSecret: env.X2_ACCESS_TOKEN_SECRET,
  })
}
