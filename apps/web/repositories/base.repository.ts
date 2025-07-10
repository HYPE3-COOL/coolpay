import { db } from '@/db';
import { eq } from 'drizzle-orm';

export abstract class BaseRepository<T, TTable> {
  protected table: TTable;
//   protected mapDbResultToEntity: (data: any) => T;

  constructor(table: TTable) {
    this.table = table;
  }
//   constructor(table: TTable, mapDbResultToEntity: (data: any) => T) {
//     this.table = table;
//     this.mapDbResultToEntity = mapDbResultToEntity;
//   }

  async findById(id: number | string | bigint): Promise<T | null> {
    const [result] = await db.select().from(this.table as any).where(eq((this.table as any).id, BigInt(id)));
    return result;
    // return result ? this.mapDbResultToEntity(result) : null;
  }

  async findAll(): Promise<T[]> {
    const results = await db.select().from(this.table as any);
    return results
    // return results.map(this.mapDbResultToEntity);
  }

  async deleteById(id: number | string | bigint): Promise<boolean> {
    await db.delete(this.table as any).where(eq((this.table as any).id, BigInt(id)));
    return true;
  }
}