import { db } from '@/db';
import { user, UserInsert, UserSelect } from '@/db/schema/user';

import { IPaginationOptions } from '@/interfaces/base.interface';
import { eq, and, isNotNull, count, desc, or, sql } from 'drizzle-orm';

import { User as PrivyUser } from '@privy-io/server-auth';
import { getHighResTwitterImage, toSnakeCase } from '@/utils/string';


export interface IUserFilter {
  privy_user_id?: string;
  username?: string;
  twitter_id?: number | string | bigint;
  is_creator?: boolean;
  is_admin?: boolean;
  q?: string; // text search
}

export class UserRepository {
  private buildWhereClause(filter?: IUserFilter) {
    if (!filter) return undefined;
    const clauses = [];
    if (filter.privy_user_id !== undefined) clauses.push(eq(user.privy_user_id, filter.privy_user_id));
    if (filter.username !== undefined) clauses.push(eq(user.username, filter.username));
    if (filter.twitter_id !== undefined) clauses.push(eq(user.twitter_id, BigInt(filter.twitter_id)));
    if (filter.is_creator !== undefined) clauses.push(eq(user.is_creator, filter.is_creator));
    if (filter.is_admin !== undefined) clauses.push(eq(user.is_admin, filter.is_admin));
    if (filter.q !== undefined && filter.q !== "") {
      const q = `%${filter.q}%`;
      clauses.push(
        or(
          sql`${user.username} ILIKE ${q}`,
          sql`${user.privy_user_id} ILIKE ${q}`,
          sql`${user.privy_wallet_id} ILIKE ${q}`,
          sql`${user.privy_wallet_address} ILIKE ${q}`,
          sql`CAST(${user.twitter_id} AS TEXT) ILIKE ${q}`
        )
      );
    }
    return clauses.length > 0 ? and(...clauses) : undefined;
  }

  async count(filter?: IUserFilter): Promise<number> {
    const whereClause = this.buildWhereClause(filter);
    const [{ count: totalCount }] = await db.select({ count: count() }).from(user).where(whereClause);
    return Number(totalCount);
  }

  async list(filter?: IUserFilter, options?: IPaginationOptions): Promise<UserSelect[]> {
    const whereClause = this.buildWhereClause(filter);
    let query: any = db.select().from(user).where(whereClause)
      .orderBy(
        desc(user.no_of_requests),
        desc(user.no_of_followers),
        desc(user.success_rate),
        desc(user.avg_cost)
      );
    if (options?.limit !== undefined) query = query.limit(options.limit);
    if (options?.offset !== undefined) query = query.offset(options.offset);
    const results: UserSelect[] = await query;
    return results;
  }

  async getUserWallets(): Promise<string[]> {
    const results = await db
      .select({ wallet: user.privy_wallet_address })
      .from(user)
      .where(isNotNull(user.privy_wallet_address))
      .limit(1000);

    return results.map(row => row.wallet);
  }

  async getById(id: number | string | bigint): Promise<UserSelect | undefined> {
    const [result] = await db.select().from(user).where(eq(user.id, BigInt(id))).limit(1);
    return result;
  }

  async getByPrivyId(privyUserId: string): Promise<UserSelect | undefined> {
    const [result] = await db.select().from(user).where(eq(user.privy_user_id, privyUserId)).limit(1);
    return result;
  }

  async getByTwitterId(twitterUserId: bigint): Promise<UserSelect | undefined> {
    const [result] = await db.select().from(user).where(eq(user.twitter_id, BigInt(twitterUserId))).limit(1);
    return result;
  }

  async getByUsername(username: string): Promise<UserSelect | undefined> {
    const [result] = await db.select().from(user).where(eq(user.username, username)).limit(1);
    return result;
  }

  async getByWalletAddress(walletAddress: string): Promise<UserSelect | undefined> {
    const [result] = await db.select().from(user).where(eq(user.privy_wallet_address, walletAddress)).limit(1);
    return result;
  }


  async create(data: UserInsert): Promise<UserSelect> {
    const [result] = await db
      .insert(user)
      .values(data)
      .returning();
    return result;
  }

  async updateByPrivyId(privyUserId: string, data: Partial<UserInsert>): Promise<UserSelect | undefined> {
    const [result] = await db
      .update(user)
      .set(data)
      .where(eq(user.privy_user_id, privyUserId))
      .returning();
    return result;
  }

  async updateByTwitterId(twitterUserId: bigint, data: Partial<UserInsert>): Promise<UserSelect | undefined> {
    const [result] = await db
      .update(user)
      .set(data)
      .where(eq(user.twitter_id, BigInt(twitterUserId)))
      .returning();
    return result;
  }

  async findOrCreate(
    data: PrivyUser,
    options?: { is_new_user?: boolean; is_creator?: boolean; is_admin?: boolean }
  ): Promise<UserSelect | undefined> {
    try {
      const { id: privyUserId, ...userData } = data;
      const { linkedAccounts, twitter, wallet } = userData;

      const twitterProfileUrl = twitter?.profilePictureUrl || '';
      const highResImage = getHighResTwitterImage(twitterProfileUrl);

      // Transform linkedAccounts to snake_case
      const transformedLinkedAccounts = linkedAccounts.map((account: any) =>
        toSnakeCase(account),
      );

      if (!twitter) {
        throw new Error('Twitter data is required to create a user');
      }

      const existingUser = await this.getByPrivyId(data.id);
      if (existingUser) {
        return await this.updateByPrivyId(privyUserId, {
          username: twitter.username || existingUser.username,
          linked_accounts: transformedLinkedAccounts,
          twitter: Object(twitter),
          image: highResImage,
          updated_at: new Date().toISOString(),
          privy_wallet_id: wallet?.id || existingUser.privy_wallet_id,
          privy_wallet_address: wallet?.address || existingUser.privy_wallet_address,
          is_new_user: options?.is_new_user || existingUser.is_new_user,
          is_creator: options?.is_creator || existingUser.is_creator,
          is_admin: options?.is_admin || existingUser.is_admin,
        });
      }

      return this.create({
        privy_user_id: privyUserId,
        username: twitter.username || '',
        linked_accounts: transformedLinkedAccounts,
        twitter: Object(twitter),
        image: highResImage,
        privy_wallet_id: wallet?.id || '',
        privy_wallet_address: wallet?.address || '',
        twitter_id: BigInt(twitter?.subject || 0),
        is_new_user: options?.is_new_user ?? false,
        is_creator: options?.is_creator ?? false,
        is_admin: options?.is_admin ?? false,
        no_of_requests: 0,
        no_of_followers: 0,
        success_rate: 0,
        avg_cost: BigInt(0),
      });
    } catch (error) {
      console.log('Error in findOrCreate:', error);
    }
  }
}
