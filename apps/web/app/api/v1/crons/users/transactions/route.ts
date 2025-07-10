import '@/app/polyfills';
import type { NextRequest } from 'next/server';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { env } from '@/env';
import { SolanaService, SolanaParsedTransaction } from '@/services/solana.service';

import { ActivityPaymentStatus, ActivityStatus, TransactionStatus, TransactionType, XTweetQueueStatus } from '@/interfaces';
import { solToLamports } from '@/utils/crypto';
import { CoolPayService } from '@/services/coolpay.service';

import { sendWarning } from '@/utils/twitter-api';

export async function GET(request: NextRequest) {

    // Check if the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    // fetch wallets to get their transactions
    const wallets = await CoolPayService.getUserWallets();

    // exclude the platform wallet
    if (wallets.includes(env.SITE_PRIVY_WALLET)) {
        const index = wallets.indexOf(env.SITE_PRIVY_WALLET);
        if (index > -1) {
            wallets.splice(index, 1);
        }
    }

    const connection = new Connection(env.RPC_URL);
    const limit = 50;

    for (const wallet of wallets) {
        const lastConfirmTxHash = await CoolPayService.getLatestConfirmedTransactionByAddress(wallet) || undefined;
        console.log(`Fetching transactions for wallet: ${wallet}, last confirmed transaction hash: ${lastConfirmTxHash}`);
        const transactions = await SolanaService.getRecentTransactions(connection, wallet, limit, lastConfirmTxHash);
        console.log(`Found ${transactions.length} transactions for wallet: ${wallet}`);
        const newTransactionData = []

        for (const tx of transactions as SolanaParsedTransaction[]) {
            const hash = tx.signature;
            const status = tx.status === 'Success' ? TransactionStatus.Confirmed : TransactionStatus.Failed;

            let from_address = null;
            let to_address = null;
            let amount = null;

            if (Array.isArray(tx.instructions)) {
                const transfer = tx.instructions.find(
                    (i: any) => i.transferInfo && i.transferInfo.from && i.transferInfo.to
                );

                if (transfer && transfer.transferInfo) {
                    from_address = transfer.transferInfo.from;
                    to_address = transfer.transferInfo.to;
                    amount = transfer.transferInfo.amount?.toString();
                }
            }

            // Insert or update transaction
            try {
                const _transaction = await CoolPayService.getTransactionByHash(hash);
                if (_transaction) {
                    // Update existing transaction
                    await CoolPayService.updateTransactionByHash(hash, {
                        status,
                        created_at: new Date(tx.blockTime).toISOString(),
                        updated_at: new Date().toISOString(),
                        meta: {
                            request_source: 'cron/transactions'
                        },
                    });

                    // Temporary
                    if (status == TransactionStatus.Confirmed) {
                        switch (_transaction.type) {
                            case TransactionType.Paid:
                                if (_transaction && _transaction.x_tweet_id) {
                                    await CoolPayService.updateActivityByTweetId(_transaction.x_tweet_id, {
                                        status: ActivityStatus.Processing,
                                    });

                                    await CoolPayService.updateXTweetQueueByTweetId(_transaction.x_tweet_id, {
                                        status: XTweetQueueStatus.Processing,
                                    });

                                    const requestUrl = `${env.HOST}requests/${_transaction.x_tweet_id}`;
                                    const message = `✅ Your request is live here: ${requestUrl} Expect reply in 48 hours.`
                                    await sendWarning(message, _transaction.x_tweet_id.toString());
                                }

                                break;

                            case TransactionType.Received:
                                if (_transaction && _transaction.x_tweet_id) {
                                    await CoolPayService.updateXTweetQueueByTweetId(_transaction.x_tweet_id, {
                                        status: XTweetQueueStatus.Done,
                                        updated_at: new Date().toISOString(),
                                    });

                                    const activity = await CoolPayService.getActivityByTweetId(_transaction.x_tweet_id);
                                    if (activity) {
                                        const amountInLamports = BigInt(activity.amount || 0);
                                        const amountInDecimal = Number(amountInLamports) / LAMPORTS_PER_SOL;
                                        const fee = CoolPayService.calculateTransactionFee(amountInDecimal, TransactionType.Refunded)
                                        const creator = await CoolPayService.getUserByTwitterId(activity.creator_id);

                                        const feeInLamports = BigInt(Math.round(fee * LAMPORTS_PER_SOL));
                                        const amountAfterFee = (BigInt(amountInLamports) - feeInLamports).toString();

                                        await CoolPayService.updateActivityByTweetId(_transaction.x_tweet_id, {
                                            status: ActivityStatus.Settled,
                                            payment_status: ActivityPaymentStatus.Paid,
                                            paid_hash: hash,
                                            fee: feeInLamports,
                                            amountAfterFee: (BigInt(amountInLamports) - feeInLamports),
                                        });

                                        // reply tweet id of the activity
                                        if (activity.first_reply_tweet_id) {
                                            const message = `✅ @${creator?.username} You have completed the request and received ${(Number(amountAfterFee) / LAMPORTS_PER_SOL).toString()} SOL to your wallet. Log in with your X account on ${env.HOST}`;
                                            await sendWarning(message, activity.first_reply_tweet_id.toString());
                                        }
                                        // await sendWarning(message, _transaction.x_tweet_id.toString());
                                    }
                                }

                                break;
                            case TransactionType.Refunded:
                                if (_transaction && _transaction.x_tweet_id) {
                                    await CoolPayService.updateXTweetQueueByTweetId(_transaction.x_tweet_id, {
                                        status: XTweetQueueStatus.Done,
                                        updated_at: new Date().toISOString(),
                                    });

                                    const activity = await CoolPayService.getActivityByTweetId(_transaction.x_tweet_id);
                                    if (activity) {
                                        const amountInLamports = BigInt(activity.amount || 0);
                                        const amountInDecimal = Number(amountInLamports) / LAMPORTS_PER_SOL;
                                        const fee = CoolPayService.calculateTransactionFee(amountInDecimal, TransactionType.Refunded)
                                        const creator = await CoolPayService.getUserByTwitterId(activity.creator_id);

                                        const feeInLamports = BigInt(Math.round(fee * LAMPORTS_PER_SOL));
                                        const amountAfterFee = (BigInt(amountInLamports) - feeInLamports).toString();

                                        await CoolPayService.updateActivityByTweetId(_transaction.x_tweet_id, {
                                            status: ActivityStatus.Expired,
                                            payment_status: ActivityPaymentStatus.Refunded,
                                            refund_hash: hash,
                                            fee: feeInLamports,
                                            amountAfterFee: (BigInt(amountInLamports) - feeInLamports),
                                        });

                                        const message = `⛔ No response from @${creator?.username}. You have been refunded ${(Number(amountAfterFee) / LAMPORTS_PER_SOL).toString()} SOL to your wallet.`;
                                        await sendWarning(message, _transaction.x_tweet_id.toString());
                                    }
                                }
                                break;

                            default:
                                console.warn(`Unknown confirmed transaction type: ${_transaction.type} hash: ${_transaction.hash}`);
                                break;
                        }
                    } else {
                        switch (_transaction.type) {
                            case TransactionType.Paid:
                                if (_transaction && _transaction.x_tweet_id) {
                                    await CoolPayService.updateActivityByTweetId(_transaction.x_tweet_id, {
                                        status: ActivityStatus.Failed,
                                    });

                                    await CoolPayService.updateXTweetQueueByTweetId(_transaction.x_tweet_id, {
                                        status: XTweetQueueStatus.Failed,
                                    });

                                    const message = `⚠️ Related transaction has been failed. Please check your wallet and tweet again.`;
                                    await sendWarning(message, _transaction.x_tweet_id.toString());
                                }
                                break;

                            default:
                                console.warn(`Unknown failed transaction type: ${_transaction.type} hash: ${_transaction.hash}`);
                                break;

                        }
                    }

                    // TODO: if confirmed, update related activity and x_tweet_queue status
                } else {
                    // temporary
                    const user = await CoolPayService.getUserByWalletAddress(wallet);

                    await CoolPayService.createTransaction({
                        hash,
                        type: TransactionType.Deposited,
                        user_id: BigInt(user?.id || 0),
                        from_address: from_address || '',
                        to_address: to_address || '',
                        amount: solToLamports(amount) ?? null,
                        status,
                        meta: {
                            request_source: 'cron/transactions'
                        },
                        created_at: new Date(tx.blockTime).toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                }
            } catch (error) {
                continue
            }
        }
    }

    return Response.json({ success: true, wallets });
}