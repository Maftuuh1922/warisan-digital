import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Warisan Digital API' }}));
  // USERS
  app.get('/api/users', async (c) => {
    // await UserEntity.ensureSeed(c.env); // Seeding can be enabled if needed
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name, email, role } = (await c.req.json()) as Partial<Pick<User, 'name' | 'email' | 'role'>>;
    if (!name?.trim() || !email?.trim() || !role) return bad(c, 'name, email, and role are required');
    const newUser: User = { 
      id: crypto.randomUUID(), 
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'pending' // Default status for new users
    };
    return ok(c, await UserEntity.create(c.env, newUser));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
}