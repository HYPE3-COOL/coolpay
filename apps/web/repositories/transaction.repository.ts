import { db } from '@/db';
import { transaction, TransactionSelect, TransactionInsert } from '@/db/schema/transaction';
import { and, eq, sql, desc, or, inArray, count } from 'drizzle-orm';
import { IPaginationOptions } from '@/interfaces/base.interface';
import { TransactionStatus, TransactionType } from '@/interfaces';

export interface ITransactionFilter {
    id?: bigint;
    hash?: string;
    type?: string;
    user_id?: bigint;
    from_address?: string;
    to_address?: string;
    status?: string;
    q?: string; // text search
}

export class TransactionRepository {
    private buildWhereClause(filter?: ITransactionFilter) {
        if (!filter) return undefined;
        const clauses = [];
        if (filter.id !== undefined) clauses.push(eq(transaction.id, BigInt(filter.id)));
        if (filter.hash !== undefined) clauses.push(eq(transaction.hash, filter.hash));
        if (filter.type !== undefined) clauses.push(eq(transaction.type, filter.type));
        if (filter.user_id !== undefined) clauses.push(eq(transaction.user_id, BigInt(filter.user_id)));
        if (filter.from_address !== undefined) clauses.push(eq(transaction.from_address, filter.from_address));
        if (filter.to_address !== undefined) clauses.push(eq(transaction.to_address, filter.to_address));
        if (filter.status !== undefined) clauses.push(eq(transaction.status, filter.status));
        if (filter.q !== undefined && filter.q !== "") {

            // Use ILIKE for case-insensitive partial match on hash, from_address, to_address
            const q = `%${filter.q}%`;
            clauses.push(
                or(
                    sql`${transaction.hash} ILIKE ${q}`,
                    sql`CAST(${transaction.x_tweet_id} AS TEXT) ILIKE ${q}`,
                    sql`${transaction.from_address} ILIKE ${q}`,
                    sql`${transaction.to_address} ILIKE ${q}`
                )
            );
        }
        return clauses.length > 0 ? and(...clauses) : undefined;
    }

    async count(filter?: ITransactionFilter): Promise<number> {
        const whereClause = this.buildWhereClause(filter);
        const [{ count: totalCount }] = await db.select({ count: count() }).from(transaction).where(whereClause);
        return Number(totalCount);
    }

    async list(filter?: ITransactionFilter, options?: IPaginationOptions): Promise<TransactionSelect[]> {
        const whereClause = this.buildWhereClause(filter);
        let query: any = db.select().from(transaction).where(whereClause).orderBy(desc(transaction.id));
        if (options?.limit !== undefined) query = query.limit(options.limit);
        if (options?.offset !== undefined) query = query.offset(options.offset);
        const results: TransactionSelect[] = await query;
        return results;
    }

    async getByHash(hash: string): Promise<TransactionSelect | undefined> {
        const [result] = await db.select().from(transaction).where(eq(transaction.hash, hash)).execute();
        return result;
    }

    async getLatestConfirmedTransactionByAddress(address: string): Promise<string | undefined> {
        const [result] = await db
            .select()
            .from(transaction)
            .where(
                and(
                    or(
                        eq(transaction.from_address, address),
                        eq(transaction.to_address, address)
                    ),
                    eq(transaction.status, TransactionStatus.Confirmed)
                )
            )
            .orderBy(desc(transaction.id))
            .limit(1)
            .execute();
        return result?.hash || undefined;
    }

    calculateFee(amount: number, type: TransactionType): number {
        if (type === TransactionType.Refunded) {
            if (amount < 10) return 0.05;
            if (amount < 100) return 0.1;
            return 0.5;
        }
        if (type === TransactionType.Received) {
            return +(amount * 0.05).toFixed(9); // 5% fee, rounded to 9 decimals for SOL
        }
        return 0;
    }

    async create(data: TransactionInsert): Promise<TransactionSelect | undefined> {
        const [result] = await db
            .insert(transaction)
            .values(data)
            .returning();
        return result;
    }

    async createMany(data: TransactionInsert[]): Promise<TransactionSelect[]> {
        const results = await db.insert(transaction).values(data).returning();
        return results;
    }

    // async updateTransactionStatus(hash: string, status: TransactionStatus): Promise<void> {
    //     await db
    //         .update(transaction)
    //         .set({ status })
    //         .where(eq(transaction.hash, hash))
    //         .execute();
    // }

    async updateByHash(hash: string, data: Partial<TransactionInsert>): Promise<TransactionSelect | undefined> {
        const [result] = await db
            .update(transaction)
            .set(data)
            .where(eq(transaction.hash, hash))
            .returning();
        return result;
    }
}