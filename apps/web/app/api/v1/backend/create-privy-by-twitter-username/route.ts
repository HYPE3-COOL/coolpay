import '@/app/polyfills';
import { NextRequest, NextResponse } from 'next/server';
import { PrivyService } from '@/services/privy.service';
import { userByUsername } from '@/utils/twitter-api';
import { getHighResTwitterImage } from '@/utils/string';

import { User } from '@privy-io/server-auth';
import { CoolPayService } from '@/services/coolpay.service';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const username = body.username;

    if (!username) {
        return NextResponse.json({ error: 'Missing twitter username' }, { status: 400 });
    }

    try {
        let userFromPrivy: User | null = null;
        userFromPrivy = await PrivyService.getUserByTwitterUsername(username);

        // if user does not exist in privy, create a new user with twitter username
        if (!userFromPrivy) {
            const _twitter = await userByUsername(username);        // get the user by username from X API
            if (_twitter) {
                userFromPrivy = await PrivyService.pregeneratePrivyUserByTwitter({
                    id: _twitter.id,
                    username: _twitter.username,
                    name: _twitter.name,
                    image: getHighResTwitterImage(_twitter.profile_image_url)
                })
            }
        }

        // create the user and x_user for creator in the database if it doesn't exist
        if (userFromPrivy) {
            const user = await CoolPayService.findOrCreateUser(userFromPrivy, { is_creator: true });
        }

        const privyUser = await PrivyService.getUserById(userFromPrivy?.id || '');

        return NextResponse.json({
            status: 'success',
            privyUser,

        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}