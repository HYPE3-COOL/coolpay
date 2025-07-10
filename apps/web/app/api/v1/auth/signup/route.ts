import '@/app/polyfills';
import { NextRequest, NextResponse } from 'next/server';
import { privyClient } from '@/utils/privy';
import { User } from '@privy-io/server-auth';

import { getUserFromRequest } from '@/utils/server/auth';
import { CoolPayService } from '@/services/coolpay.service';

export async function POST(req: NextRequest) {
    try {
        const privyUserId = await getUserFromRequest(req);
        const privyUser: User = await privyClient.getUserById(privyUserId)
        
        const user = await CoolPayService.findOrCreateUser(privyUser);
        return NextResponse.json({ message: 'Users created successfully', data: user }, { status: 201 });

    } catch (error: any) {
        console.error('Failed to sign up via Privy:', error.message);
        return NextResponse.json({ error: 'Failed to sign up' }, { status: 400 });
    }
}