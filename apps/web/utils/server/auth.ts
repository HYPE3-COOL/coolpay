import { NextRequest } from 'next/server';
import { privyClient } from '@/utils/privy';

export async function getUserFromRequest(req: NextRequest): Promise<string> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        throw new Error('Unauthorized');
    }
    const [type, token] = authHeader.split(' ') ?? [];
    if (!token || type !== 'Bearer') {
        throw new Error('Unauthorized');
    }
    const verifiedClaims = await privyClient.verifyAuthToken(token);
    if (!verifiedClaims) {
        throw new Error('Unauthorized');
    }
    // const privyUserId = verifiedClaims.userId;
    // console.log('Authorization token check for request URL:', req.url);
    return verifiedClaims.userId;
}