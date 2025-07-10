import { NextRequest } from 'next/server';
import { ClassicTweetAnalyzer } from '@/services/classic-tweet-analyzer.service';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();
        if (!text || typeof text !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing or invalid text' }), { status: 400 });
        }
        const platformAccount = process.env.NEXT_PUBLIC_SITE_X_USERNAME || '';
        const { creator, amount, token, platform_account } = ClassicTweetAnalyzer.analyze(text, platformAccount);

        return Response.json({ creator, amount, token, platform_account });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || e?.toString() || 'Unknown error' }), { status: 500 });
    }
}