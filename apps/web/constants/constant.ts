export const DEFAULT_USER_PROFILE_PIC = Array.from({ length: 7 }).map(
  (_, index) => `/assets/images/avatar${index}.png`,
);
export const MENTION_LOOKBACK_DAYS = 7;
export const MENTION_REPLY_PROCESSING_HOURS = 12; // 48 hours

export const MINIMUM_REQUEST_AMOUNT = 0.1; // 0.1 SOL

export const TRANSACTION_FEE = 0.001; // 0.001 SOL 

export const PAGE_SIZE = 10;

export const LINK_HOW_TO = 'https://cool-pay.gitbook.io/cool-pay-docs';

// activity status 
export const STATUS_LABELS = {
  funded: "Funded",
  paid: "Paid",
  refunded: "Refunded",
};

