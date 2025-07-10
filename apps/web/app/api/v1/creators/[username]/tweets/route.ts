import '@/app/polyfills';
import { NextRequest } from 'next/server';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const username = params.username;
    if (!username) return new Response('Missing username', { status: 400 });

    const user = await CoolPayService.getUserByUsername(username);
    if (!user) {
      return new Response('User not found', { status: 404 });
    }
    const userId = user.id;

    const stats = await CoolPayService.getActivities({
      user_id: userId,
    });

    return Response.json({ data: stats });
  } catch (error) {
    console.error('Failed to fetch creator tweet statistics:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
