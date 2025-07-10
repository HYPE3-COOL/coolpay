import '@/app/polyfills';
import { NextRequest, NextResponse } from 'next/server';

import { getUserFromRequest } from '@/utils/server/auth';
import { CoolPayService } from '@/services/coolpay.service';

export async function GET(req: NextRequest) {
    try {
        const privyUserId = await getUserFromRequest(req);
        const user = await CoolPayService.getUserByPrivyId(privyUserId);
        return NextResponse.json({ message: 'Users created successfully', data: user }, { status: 200 });

    } catch (error: any) {
        console.error('Failed to fetch getMe', error.message);
        return NextResponse.json({ error: 'Failed to fetch getMe' }, { status: 400 });
    }
}