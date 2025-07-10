import { BadRequest, Details, Status } from '@repo/error'
import { z, ZodSchema } from 'zod';

export type Result<S extends ZodSchema> =
  | { data: z.infer<S>; error: null }
  | { data: null; error: Response };

export async function validator<S extends ZodSchema>(
  request: Request,
  schema: S
): Promise<Result<S>> {
  const json = await request.json();
  const validator = await schema.safeParseAsync(json);
  if (validator.success) return { data: validator.data, error: null };
  const fieldViolations: BadRequest['fieldViolations'] = validator.error.issues.map(
    ({ path, message }) => ({ field: path.join('.'), description: message })
  );
  const details = Details.new().badRequest({ fieldViolations });
  const error = Response.json(Status.invalidArgument().response(details), { status: 400 });
  return { data: null, error };
}
