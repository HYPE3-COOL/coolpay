import { useCallback, useState } from 'react';
import {
  PublicKey,
  SystemProgram,
  Connection,
  Transaction,
} from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';

import { useSendTransaction, useSolanaWallets, ConnectedSolanaWallet } from '@privy-io/react-auth/solana';

export function usePrivyWithdraw(cluster: 'devnet' | 'mainnet-beta' = 'devnet') {
  const { user, ready } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { wallets } = useSolanaWallets();
  const { sendTransaction } = useSendTransaction();
  // const connection = new Connection(process.env.NEXT_PUBLIC_ENV === 'prod' ?
  //   'https://api.mainnet-beta.solana.com'
  //   : 'https://api.devnet.solana.com', 'confirmed');

  const connection = new Connection(
    cluster === 'mainnet-beta'
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com'
  );

  const withdraw = useCallback(
    async (payerAddress: string, recipientAddress: string, amountSol: number) => {
      setLoading(true);
      setError(null);
      setTxHash(null);

      try {
        console.log({
          recipientAddress,
          amountSol,
          cluster,
          payerAddress,
        })
        if (!recipientAddress || !amountSol) {
          alert('Please enter recipient address and amount');
          return;
        }

        const lamports = Math.floor(amountSol * 1e9); // convert SOL to lamports
        const wallet = wallets[0];
        const walletPublicKey = new PublicKey(payerAddress);
        const recipientPublicKey = new PublicKey(recipientAddress);

        // if (!user?.wallet?.address || !user.wallet.id || !user.wallet.walletClientType) {
        //   throw new Error('No embedded wallet found');
        // }

        const instruction = SystemProgram.transfer({
          fromPubkey: walletPublicKey,
          toPubkey: recipientPublicKey,
          lamports,
        });

        const transaction = new Transaction().add(instruction);
        const receipt = await sendTransaction({
          transaction,
          connection,
        });

        console.log('Transaction successful with signature:', receipt.signature);
        alert(`Transaction sent! Signature: ${receipt.signature}`);

      } catch (e: any) {
        setError(e.message || 'Withdraw failed');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [user, cluster]
  );

  return { withdraw, loading, error, txHash };
}
