import { IBase } from "@/interfaces/base.interface";

export enum ActivityStatus {
  Pending = 'pending',  // initial state
  Processing = 'processing',  // monitoring for responses
  Rejected = 'rejected',
  Failed = 'failed',
  Succeeded = 'succeeded',    // has response
  Settled = 'settled',      // has payment settled
  Expired = 'expired',    // timed out, no response
}

export enum ActivityPaymentStatus {
  Funded = 'funded',
  Paid = 'paid',
  Refunded = 'refunded',
}