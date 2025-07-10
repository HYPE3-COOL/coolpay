import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';

export interface SolanaParsedInstruction {
  programId: string;
  program: string;
  parsed: any;
  transferInfo: {
    from: string;
    to: string;
    amount: number;
  } | null;
}

export interface SolanaParsedTransaction {
  signature: string;
  blockTime: string;
  status: 'Success' | 'Failed';
  instructions: SolanaParsedInstruction[];
}

export class SolanaService {
  /**
   * Fetches recent transactions for a given Solana address.
   * @param address Solana public key (string)
   * @param limit Number of transactions to fetch (max 1000)
   * @param before Optional: fetch transactions before this signature (for pagination)
   */
  static async getRecentTransactions(
    connection: Connection,
    address: string,
    limit = 50,
    until?: string
  ): Promise<SolanaParsedTransaction[]> {
    const pubKey = new PublicKey(address);

    // Step 1: Get recent transaction signatures
    const options: any = { limit };
    if (until) options.until = until;

    const signatures = await connection.getSignaturesForAddress(pubKey, options, "confirmed");
    const signatureList = signatures.map(sig => sig.signature);

    // Step 2: Get parsed transaction details
    const transactions = await connection.getParsedTransactions(signatureList, {
      commitment: 'finalized',
      maxSupportedTransactionVersion: 0,
    });

    // Step 3: Map and return relevant info
    return transactions
      .map((tx, idx) => {
        if (!tx) return null;
        const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null;
        const status = tx.meta?.err ? 'Failed' : 'Success';
        const instructions = tx.transaction.message.instructions.map((ix: any, i: number) => {
          let transferInfo = null;
          if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
            const info = ix.parsed.info;
            transferInfo = {
              from: info.source,
              to: info.destination,
              amount: info.lamports / 1e9,
            };
          }
          return {
            programId: ix.programId.toString(),
            program: ix.program,
            parsed: ix.parsed,
            transferInfo,
          };
        });
        return {
          signature: signatureList[idx],
          blockTime,
          status,
          instructions,
        } as SolanaParsedTransaction;
      })
      .filter((tx): tx is SolanaParsedTransaction => tx !== null);
  }

  // /**
  //  * Get a Solana connection for a given cluster
  //  */
  // static getConnection(cluster: 'devnet' | 'mainnet-beta' = 'devnet') {
  //   return new Connection(
  //     cluster === 'mainnet-beta'
  //       ? 'https://api.mainnet-beta.solana.com'
  //       : 'https://api.devnet.solana.com'
  //   );
  // }

  // /**
  //  * Create a Solana transfer instruction (generic for devnet/mainnet)
  //  * @param fromAddress sender's public key (string)
  //  * @param toAddress recipient's public key (string)
  //  * @param amount amount in SOL (number)
  //  * @param cluster 'devnet' | 'mainnet-beta'
  //  * @returns { instruction, payer, connection }
  //  */
  // static getTransferInstruction({ fromAddress, toAddress, amount }: {
  //   fromAddress: string;
  //   toAddress: string;
  //   amount: number;
  // }) {
  //   const payer = new PublicKey(fromAddress);

  //   const instruction = SystemProgram.transfer({
  //     fromPubkey: payer,
  //     toPubkey: new PublicKey(toAddress),
  //     lamports: Math.floor(amount * LAMPORTS_PER_SOL),
  //   });

  //   return { instruction, payer };
  // }

  /**
   * Get the SOL balance for a given wallet address.
   * @param connection Solana connection object
   * @param address Solana public key (string)
   * @returns Balance in SOL (decimal format)
   */
  static async getSolBalance(connection: Connection, address: string): Promise<number> {
    const pubKey = new PublicKey(address);
    const lamports = await connection.getBalance(pubKey);
    return lamports / LAMPORTS_PER_SOL;
  }
}
