import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

/**
 * libSQL client, shared for the process lifetime. Local dev talks to a plain
 * SQLite file (`file:orbit.db`) with zero network calls; production points
 * TURSO_DATABASE_URL/TURSO_AUTH_TOKEN at a hosted Turso database — same
 * SQLite dialect, same schema, so this is the only file that changes between
 * the two. Cached on globalThis so Next.js dev-mode hot reloads and repeated
 * serverless invocations in the same warm container reuse one connection.
 */

declare global {
  // eslint-disable-next-line no-var
  var __orbitDb: Promise<Client> | undefined;
}

async function createDb(): Promise<Client> {
  const remoteUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const localPath = process.env.ORBIT_DB_PATH ?? path.join(process.cwd(), 'orbit.db');

  const client = remoteUrl
    ? createClient({ url: remoteUrl, authToken })
    : createClient({ url: `file:${localPath}` });

  // WAL/foreign_keys pragmas only make sense for a local file — a hosted
  // Turso database manages its own storage engine, so skip them there.
  if (!remoteUrl) {
    try {
      await client.execute('PRAGMA journal_mode = WAL');
      await client.execute('PRAGMA foreign_keys = ON');
    } catch {
      /* non-fatal — proceed without them */
    }
  }

  const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'), 'utf-8');
  await client.executeMultiple(schema);

  return client;
}

export function getDb(): Promise<Client> {
  if (!globalThis.__orbitDb) {
    globalThis.__orbitDb = createDb();
  }
  return globalThis.__orbitDb;
}
