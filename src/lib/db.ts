import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.ORBIT_DB_PATH ?? path.join(process.cwd(), 'orbit.db');

declare global {
  // eslint-disable-next-line no-var
  var __orbitDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const schema = fs.readFileSync(path.join(process.cwd(), 'src/lib/schema.sql'), 'utf-8');
  db.exec(schema);
  return db;
}

// Cached on globalThis so Next.js dev-mode module reloads don't open a new
// SQLite handle (and WAL lock) on every hot reload.
export function getDb(): Database.Database {
  if (!globalThis.__orbitDb) {
    globalThis.__orbitDb = createDb();
  }
  return globalThis.__orbitDb;
}
