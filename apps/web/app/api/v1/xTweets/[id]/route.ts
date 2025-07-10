import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { XTweetService } from '@/services/x-tweet.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);
    if (isNaN(Number(id))) return new Response('Invalid Tweet ID', { status: 400 });

    const tweet = await XTweetService.getById(id);
    if (!tweet) {
      return new Response('Tweet not found', { status: 404 });
    }
    return Response.json({ data: tweet });
  } catch (error) {
    console.error('Failed to fetch tweet:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
