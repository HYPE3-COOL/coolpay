import { useCallback, useState } from 'react';

import { notifications } from '@mantine/notifications';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets, ConnectedSolanaWallet } from '@privy-io/react-auth/solana';

// import { SolanaService } from '@/services/solana.service';
import { useCreateTransaction } from './useTransaction';
import { TransactionStatus, TransactionType } from '@/interfaces';


function getEmbeddedWallet(wallets: ConnectedSolanaWallet[]): ConnectedSolanaWallet | null {
  if (!wallets || wallets.length === 0) return null;
  return wallets.find(
    (wallet) => wallet.walletClientType === 'privy' && wallet.connectorType === 'embedded'
  ) || null;
}

export function useEmbeddedSolWithdraw(cluster: 'devnet' | 'mainnet-beta' = 'devnet') {

  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { mutate: createTransaction } = useCreateTransaction();

  const withdraw = useCallback(
    async (recipientAddress: string, amount: number) => {
      setLoading(true);
      setError(null);
      setTxHash(null);

      try {
        if (!user?.wallet?.address) {
          throw new Error('No wallet address found');
        }
        const embeddedWallet = getEmbeddedWallet(wallets);
        if (!embeddedWallet) {
          throw new Error('No embedded wallet found');
        }

        const connection = new Connection(
          cluster === 'mainnet-beta'
            ? 'https://api.mainnet-beta.solana.com'
            : 'https://api.devnet.solana.com'
        );

        // Use shared SolanaService for transfer instruction and connection
        const payer = new PublicKey(embeddedWallet.address);

        const instruction = SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: new PublicKey(recipientAddress),
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        });

        // const { instruction, payer } = SolanaService.getTransferInstruction({
        //   fromAddress: embeddedWallet.address,
        //   toAddress: recipientAddress,
        //   amount
        // });

        let transaction = new Transaction();
        transaction.add(instruction);

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payer;

        console.log('Transaction before signing:', transaction);
        const signedTransaction = await embeddedWallet.signTransaction!(transaction);
        const txHash = await embeddedWallet.sendTransaction!(signedTransaction, connection);
        setTxHash(txHash);

        notifications.show({
          title: 'Withdraw Successful',
          message: `Transaction sent! Signature: ${txHash}`,
          color: 'teal',
          autoClose: 6000,
        });

        // Record transaction in backend using mutation
        const lamports = amount * LAMPORTS_PER_SOL;

        createTransaction({
          hash: txHash,
          type: TransactionType.Withdrawal,
          user_id: Number(user?.id),
          from_address: embeddedWallet.address,
          to_address: recipientAddress,
          amount: lamports.toString(),
          status: TransactionStatus.Pending,
          meta: { request_source: 'frontend/withdraw' },
        });

        return txHash;
      } catch (e: any) {
        setError(e.message || String(e));
        notifications.show({
          title: 'Withdraw Failed',
          message: e.message || String(e),
          color: 'red',
          autoClose: 6000,
        });
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [user, wallets, cluster]
  );

  return { withdraw, loading, error, txHash };
}
