import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getPrivyClient } from '@/utils/privy/privyServerClient';

// import { SolanaService } from '../solana.service';
import { PrivyService } from '../privy.service';
import { env } from '@/env';

export interface TransferParams {
    cluster: string;
    fromAddress: string;
    toAddress: string;
    token?: 'SOL';
    amount: number;
    fee?: number; // Optional fee, if needed
    walletId?: string;
}


export async function transfer({
    cluster,
    fromAddress,
    toAddress,
    token,
    amount,
    fee,
    walletId,
}: TransferParams): Promise<{
    success: boolean;
    txHash?: string;
    blockhash?: string;
}> {
    // Validate inputs
    if (!cluster || (cluster !== 'devnet' && cluster !== 'mainnet-beta')) {
        throw new Error('Invalid cluster. Must be "devnet" or "mainnet-beta".');
    }

    // set up connection
    const connection = new Connection(env.SOLANA_ENV! === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com');

    // set up transfer instruction
    const payer = new PublicKey(fromAddress);
    if (!payer) {
        throw new Error('Invalid payer address');
    }

    const recipient = new PublicKey(toAddress)
    if (!recipient) {
        throw new Error('Invalid recipient address');
    }

    if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
    }

    if (isNaN(amount)) {
        throw new Error('Amount must be a valid number');
    }

    const total = fee ? amount + fee : amount;
    if (total <= 0) {
        throw new Error('Total amount (including fee) must be greater than zero');
    }
    if (isNaN(total)) {
        throw new Error('Total amount must be a valid number');
    }

    const instruction = SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: recipient,
        lamports: Math.floor(total * LAMPORTS_PER_SOL),         // only SOL is supported
    });

    const { blockhash } = await connection.getLatestBlockhash();

    const message = new TransactionMessage({
        payerKey: payer,
        instructions: [instruction],
        recentBlockhash: blockhash,
    });
    const transaction = new VersionedTransaction(message.compileToV0Message());

    // https://docs.privy.io/api-reference/wallets/solana/sign-and-send-transaction
    const capi2 = PrivyService.getCaip2ByCluster(cluster);

    if (!walletId) {
        throw new Error('Wallet ID is required for signing and sending the transaction');
    }

    const tx = await getPrivyClient().walletApi.solana.signAndSendTransaction({
        walletId: walletId,
        caip2: capi2,
        transaction,
    });

    return {
        success: !!tx.hash,
        txHash: tx.hash,
        blockhash,
    }
}