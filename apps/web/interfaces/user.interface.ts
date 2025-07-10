import { IBase } from "@/interfaces/base.interface";

export interface IUser extends IBase {
  id: number;
  privy_user_id: string;
  username: string;
  image: string;
  linked_accounts: object[];
  twitter: any;
  // twitter: {
  //   name: string;
  //   subject: string;
  //   username: string;
  //   verifiedAt: string;
  //   firstVerifiedAt: string;
  //   latestVerifiedAt: string;
  //   profilePictureUrl: string;
  //   [key: string]: any;
  // };
  twitter_id: bigint;
  is_new_user: boolean;
  is_creator: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  no_of_requests: number;
  no_of_followers: number;
  success_rate: number;
  avg_cost: number;
  // requests?: number;
  // responseRate?: number;
  // avgCost?: number;
}

export function mapUserApiResultToIUser(data: any): IUser {
  return {
    ...data,
    id: Number(data.id),
    // twitter_id: data.twitter_id ? BigInt(data.twitter_id) : undefined,
    twitter: {
      ...data.twitter,
      // If your API sometimes returns snake_case, map to camelCase here
      verifiedAt: data.twitter.verifiedAt || data.twitter.verified_at,
      firstVerifiedAt: data.twitter.firstVerifiedAt || data.twitter.first_verified_at,
      latestVerifiedAt: data.twitter.latestVerifiedAt || data.twitter.latest_verified_at,
      profilePictureUrl: data.twitter.profilePictureUrl || data.twitter.profile_picture_url,
    },
    // requests: data.requests ?? 0,
    // responseRate: data.responseRate ?? 0,
    // avgCost: data.avgCost ?? 0,
  };
}


export interface IUserInsert {
  privy_user_id: string;
  username: string;
  image: string;
  linked_accounts?: object[];
  twitter?: any; // Adjust type as needed
  twitter_id: bigint;
  is_new_user?: boolean;
  is_creator?: boolean;
  is_admin?: boolean;
}