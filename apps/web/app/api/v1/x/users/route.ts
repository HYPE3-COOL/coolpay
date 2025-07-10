import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { xUser } from '@/db/schema/x';
import { usersByUsernames } from '@/utils/twitter-api';
import { validator } from '@/utils/validate';

const schema = z.object({
  usernames: z
    .string()
    .min(1)
    .max(50)
    .array()
    .min(1)
    .max(100)
    .transform((arr) => Array.from(new Set(arr))),
});

export async function POST(request: Request) {
  const { data, error } = await validator(request, schema);
  if (error) return error;
  const { usernames } = data;
  const users = await usersByUsernames(usernames);
  const values = users.map((u) => ({
    id: BigInt(u.id),
    name: u.name,
    username: u.username,
    profile_image_url: u.profile_image_url,
    created_at: u.created_at,
    verified: u.verified,
    protected: u.protected,
    url: u.url,
    description: u.description,
    public_metrics: u.public_metrics,
    entities: u.entities,
  }));

  const result = await db
    .insert(xUser)
    .values(values)
    .onConflictDoUpdate({
      target: xUser.id,
      set: {
        name: sql`excluded.name`,
        username: sql`excluded.username`,
        profile_image_url: sql`excluded.profile_image_url`,
        verified: sql`excluded.verified`,
        protected: sql`excluded.protected`,
        url: sql`excluded.url`,
        description: sql`excluded.description`,
        public_metrics: sql`excluded.public_metrics`,
        entities: sql`excluded.entities`,
      },
    })
    .returning();

  return Response.json({ users: result });
}
