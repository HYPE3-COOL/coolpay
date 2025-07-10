import { NextRequest, NextResponse } from 'next/server';
import { SolanaService } from '@/services/solana.service';
import { Connection } from '@solana/web3.js';
import { env } from '@/env';

// GET /api/v1/solana/transactions?address=...&limit=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const limit = parseInt(searchParams.get('limit') || '100', 100);
  const before = searchParams.get('before');

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  try {
    const connection = new Connection(env.RPC_URL);
    const transactions = await SolanaService.getRecentTransactions(connection, address, limit, before || undefined);
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
