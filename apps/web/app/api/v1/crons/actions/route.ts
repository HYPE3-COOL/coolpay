
import '@/app/polyfills';
import type { NextRequest } from 'next/server';
import { AxiosError } from 'axios';

import { env } from '@/env';
import { LINK_HOW_TO, MINIMUM_REQUEST_AMOUNT, TRANSACTION_FEE } from '@/constants/constant';

import { PrivyService } from '@/services/privy.service';

// import { AiService, PromptType } from '@/services/ai.service';
import { SolanaService } from '@/services/solana.service';

import { transfer } from '@/services/server/event';

import { sendWarning, userByUsername } from '@/utils/twitter-api';

import { User } from '@privy-io/server-auth';
import { getHighResTwitterImage } from '@/utils/string';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CoolPayService } from '@/services/coolpay.service';
import { ClassicTweetAnalyzer } from '@/services/classic-tweet-analyzer.service';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // get all unclassified mentions from the database, with their tweets
        const mentionTweets = await CoolPayService.getPendingMention();
        for (const mentionTweet of mentionTweets) {
            const _tweet = mentionTweet.tweet;
            const authorTwitterId = _tweet.author_id || '0'; // default to '0' if author_id is not present

            // special treatment to prevent looping on own tweets
            if (_tweet.text.includes(`Your request is incomplete`)) {
                console.log(`Skipping tweet ${_tweet.id} as it is already processed or incomplete.`);
                continue;
            }

            // 1. check if the author is registered in privy as user
            const authorId = _tweet.author_id;
            if (!authorId) {
                await CoolPayService.updateXTweetQueueNotRegistered(mentionTweet.queue.id);
                const message = `⚠️ You have not signed up with us. Please visit ${env.HOST} to create an account.`;
                await sendWarning(message, _tweet.id.toString());
                continue;
            }

            const authorPrivyUser = await PrivyService.getUserByTwitterId(authorId.toString());
            if (!authorPrivyUser) {
                await CoolPayService.updateXTweetQueueNotRegistered(mentionTweet.queue.id);
                const message = `⚠️ You have not signed up with us. Please visit ${env.HOST} to create an account.`;
                await sendWarning(message, _tweet.id.toString());
                continue;
            }

            // 2. check if the user has a privy wallet
            let wallet = null;
            if (authorPrivyUser) {
                wallet = PrivyService.getActiveWalletFromPrivyUser(authorPrivyUser);
            }

            // 3. check if the user's privy wallet is delegated
            if (!wallet && !wallet.delegated) {
                await CoolPayService.updateXTweetQueueWalletNotDelegated(mentionTweet.queue.id);
                const message = `⚠️ You have not authorized this transaction. Please visit ${env.HOST} to delegate your wallet.`;
                await sendWarning(message, _tweet.id.toString());
                continue;
            }


            // 4. check nature of the mention tweet through AI analysis
            const platformAccount = env.SITE_X_USERNAME!;
            const { creator, amount, token, platform_account } = ClassicTweetAnalyzer.analyze(_tweet.text, platformAccount);
            // const result = await AiService.analyze(PromptType.Instruction, _tweet.text);
            // const data = result?.extractedData || result || {};
            // const { creator, amount, token, platform_account } = data;

            // 5. validate the tweet content
            let creatorValid = false;
            let creatorTwitterId: string = '0';
            if (creator && _tweet.entities && _tweet.entities?.mentions) {
                const found = _tweet.entities.mentions.find((m: any) => m.username?.toLowerCase() === creator.toLowerCase());
                creatorValid = !!found;
                if (found && found.id) {
                    creatorTwitterId = found.id;
                }
            }

            if (!creatorValid) {
                await CoolPayService.updateXTweetQueueCreatorNotMentioned(mentionTweet.queue.id);
                const message = `⚠️ Your request is incomplete. Read our FAQ here: ${LINK_HOW_TO}`;
                await sendWarning(message, _tweet.id.toString());
                continue;
            }

            // 6. update the action status to pending
            if (
                amount &&
                amount > 0 &&
                token &&
                token.toUpperCase() === 'SOL' &&
                platform_account &&
                platform_account === env.SITE_X_USERNAME
            ) {
                if (amount < MINIMUM_REQUEST_AMOUNT) {
                    await CoolPayService.updateXTweetQueueLessThanMinimum(mentionTweet.queue.id);
                    const message = `⚠️ You need to pay a minimum of ${MINIMUM_REQUEST_AMOUNT} SOL. Please tweet again with a higher amount.`;
                    await sendWarning(message, _tweet.id.toString());
                    continue;
                }
            } else {
                await CoolPayService.updateXTweetQueueIncompleteRequest(mentionTweet.queue.id, {
                    request_source: 'cron/action',
                    text: _tweet.text,
                    amount,
                    token,
                    platform_account
                });
                const message = `⚠️ Your request is incomplete. Read our FAQ here: ${LINK_HOW_TO}`;
                await sendWarning(message, _tweet.id.toString());
                continue;
            }

            // 7. check if the privy user has enough balance in their wallet
            const connection = new Connection(env.SOLANA_ENV! === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com');
            const balance = await SolanaService.getSolBalance(connection, wallet?.address);

            if (balance < amount + TRANSACTION_FEE) {
                await CoolPayService.updateXTweetQueueInsufficientBalance(mentionTweet.queue.id);
                const message = `⚠️ Insufficient balance: The request requires ${amount} SOL. Please top up your wallet at ${env.HOST} and tweet again.`
                await sendWarning(message, _tweet.id.toString());
                continue;
            }

            // 8. create creator
            let creatorPrivyUser: User | null = null;
            creatorPrivyUser = await PrivyService.getUserByTwitterUsername(creator);

            if (!creatorPrivyUser) {
                const _twitter = await userByUsername(creator);        // get the user by username from X API
                if (_twitter) {
                    creatorPrivyUser = await PrivyService.pregeneratePrivyUserByTwitter({
                        id: _twitter.id,
                        username: _twitter.username,
                        name: _twitter.name,
                        image: getHighResTwitterImage(_twitter.profile_image_url)
                    })
                }
            }

            // create the user and x_user for creator in the database if it doesn't exist
            if (creatorPrivyUser) {
                const user = await CoolPayService.findOrCreateUser(creatorPrivyUser, { is_creator: true });
            }

            // 9. transfer the amount to the master wallet
            // without the fee

            if (authorPrivyUser && creatorPrivyUser && wallet) {
                try {
                    const { success, txHash, blockhash } = await transfer({
                        cluster: env.SOLANA_ENV!,
                        fromAddress: wallet.address,
                        toAddress: env.SITE_PRIVY_WALLET!,
                        token: 'SOL',
                        amount: amount,
                        fee: 0,
                        walletId: wallet.id,
                    });

                    if (success && txHash) {
                        // Convert SOL to lamports (1 SOL = 1_000_000_000 lamports)
                        const lamports = BigInt(Math.floor(amount * LAMPORTS_PER_SOL));

                        await CoolPayService.createTransactionAndActivity({
                            hash: txHash,
                            user_twitter_id: authorTwitterId,
                            creator_twitter_id: creatorTwitterId,
                            x_tweet_id: _tweet.id,
                            from_address: wallet.address,
                            to_address: env.SITE_PRIVY_WALLET!,
                            amount: lamports.toString(),
                            cluster: env.SOLANA_ENV!,
                            x_tweet_queue_id: mentionTweet.queue.id,
                        });

                        // TODO: should be ready and send message after transaction is confirmed
                        // const requestUrl = `${env.HOST}requests/${mentionTweet.queue.tweet_id}`;
                        // const message = `✅ Your request is live here: ${requestUrl} Expect reply in 48 hours.`
                        // await sendWarning(message, _tweet.id.toString());
                    }
                } catch (error) {
                    console.error('[GET /api/v1/crons/action] Error creating transaction or activity:', error);
                    await CoolPayService.updateXTweetQueueOther(mentionTweet.queue.id, {
                        meta: {
                            error: JSON.stringify(error),
                            request_source: 'cron/action',
                            privy_user_id: authorPrivyUser.id,
                            amount,
                            token,
                            creator_privy_user_id: creatorPrivyUser.id,
                            x_tweet_id: _tweet.id.toString(),
                        }
                    });
                    const message = `⛔ Failed to process your request. Please tweet again later.`;
                    await sendWarning(message, _tweet.id.toString());
                }
            }
        }

        return Response.json({ success: true });
    } catch (e) {
        console.error('[GET /api/v1/crons/action] Error processing mentions:', e);
        if (e instanceof AxiosError) {
            console.error('[GET /api/v1/crons/action] Axios error:', e.response?.data);
        }
        return Response.json({ success: false, error: e });
    }
}
