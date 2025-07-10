export enum TransactionType {
  Deposited = 'deposited',      // deposit fund from external wallet to privy embedded wallet through privy SDK
  Withdrawal = 'withdrawal',    // withdraw fund from privy embedded wallet to external wallet
  Refunded = 'refunded',
  Paid = 'paid',
  Received = 'received',
}

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
}
