/**
 * Integration test setup: creates the D1 schema in the miniflare in-memory DB.
 * Runs inside the Workers runtime (cloudflare:test env), so we use the D1 API directly.
 */
import { env } from "cloudflare:test";

// Applies migrations sequentially – each statement must be a single DDL/DML call.
const migrations = [
  `CREATE TABLE IF NOT EXISTS scans (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    dog_id     TEXT    NOT NULL,
    badge_id   TEXT    NOT NULL,
    scanned_at TEXT    NOT NULL DEFAULT (datetime('now')),
    ip_hash    TEXT,
    ua         TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_scans_dog_badge ON scans (dog_id, badge_id)`,
  `CREATE INDEX IF NOT EXISTS idx_scans_ip_hash   ON scans (ip_hash, badge_id, scanned_at)`,
  `ALTER TABLE scans ADD COLUMN source  TEXT NOT NULL DEFAULT 'qr'`,
  `ALTER TABLE scans ADD COLUMN country TEXT`,
  `ALTER TABLE scans ADD COLUMN city    TEXT`,
  `CREATE TABLE IF NOT EXISTS image_likes (
     image_key TEXT    PRIMARY KEY,
     cnt       INTEGER NOT NULL DEFAULT 0
   )`,
];

// Run once before all tests in this project
const stmts = migrations.map((sql) => env.DB.prepare(sql));
await env.DB.batch(stmts);
