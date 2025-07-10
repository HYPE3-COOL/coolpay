// import { getXApiClient } from '@/app/api/v1/x/tweets/client';
// import { createTweetSchema } from '@/app/api/v1/x/tweets/schema';
// import { getXApiClient } from './client';
import { createTweetSchema } from './schema';
import { validator } from '@/utils/validate';

export async function POST(request: Request) {
  const { data, error } = await validator(request, createTweetSchema);
  if (error) return error;
  // const client = await getXApiClient();
  // const result = await client.v2.tweet(data);
  // return Response.json(result.data);
}
