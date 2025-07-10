import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function getLatestSolanaPrice() {
  return useQuery({
    queryKey: ['solInUsdPrice'],
    queryFn: async () => {
      const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');

      if (!data || !data.solana || !data.solana.usd) {
        throw new Error('Failed to fetch Solana price');
      }

      return data.solana.usd;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}


export function useSolanaBalance(address?: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet') {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const connection = new Connection(
        cluster === 'mainnet-beta'
          ? 'https://api.mainnet-beta.solana.com'
          : 'https://api.devnet.solana.com'
      );
      const pubkey = new PublicKey(address);
      const lamports = await connection.getBalance(pubkey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (e) {
      setError('Failed to fetch balance');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [address, cluster]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refresh: fetchBalance };
}