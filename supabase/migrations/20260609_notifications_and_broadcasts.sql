-- ─── Notification center (in-app, DB-backed) ─────────────────

-- 1. Per-user notifications feed
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL,
  type        text        NOT NULL DEFAULT 'system',   -- 'broadcast' | 'reminder' | 'system'
  title       text        NOT NULL,
  body        text,
  link        text,
  is_read     boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (user_id) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. Broadcast log (admin history)
CREATE TABLE IF NOT EXISTS broadcasts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  body            text,
  link            text,
  sent_by         text,
  recipient_count integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_created
  ON broadcasts (created_at DESC);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- 3. Retention cleanup cron — harian 23:30 UTC (06:30 WIB)
--    hapus notif yang sudah dibaca > 30 hari, dan semua notif > 90 hari
SELECT cron.schedule(
  'pintuasn-notif-cleanup',
  '30 23 * * *',
  $$
  DELETE FROM notifications
  WHERE (is_read = true AND created_at < now() - interval '30 days')
     OR (created_at < now() - interval '90 days');
  $$
);
