// import { IUser } from './user.interface';
import { BaseKey } from '@refinedev/core';

export interface IBase {
  id?: number | BaseKey;
  // createdBy?: IUser;
  // createdAt?: string;
  // updatedBy?: IUser;
  // updatedAt?: string;
}

export interface IPaginationOptions {
  limit?: number;
  offset?: number;
}

export interface ICreateTransactionAndActivity {
  hash: string;
  user_twitter_id: bigint | string;
  creator_twitter_id: bigint | string;
  x_tweet_id?: bigint | string; // optional, can be bigint or string 
  from_address: string;
  to_address: string;
  amount: bigint | string; // lamports, can be bigint or string
  cluster: string;
  x_tweet_queue_id: bigint | string;
}


