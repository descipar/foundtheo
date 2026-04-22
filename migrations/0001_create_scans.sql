CREATE TABLE IF NOT EXISTS scans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id      TEXT    NOT NULL,
  badge_id    TEXT    NOT NULL,
  scanned_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  ip_hash     TEXT,
  ua          TEXT
);

CREATE INDEX IF NOT EXISTS idx_scans_dog_badge ON scans (dog_id, badge_id);
CREATE INDEX IF NOT EXISTS idx_scans_ip_hash   ON scans (ip_hash, badge_id, scanned_at);
