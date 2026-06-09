-- ─── Push Notifications: device_tokens + pg_cron ─────────────

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. custom_days column on user_reminder_preferences
ALTER TABLE user_reminder_preferences
  ADD COLUMN IF NOT EXISTS custom_days integer[] DEFAULT NULL;

-- 3. device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text        NOT NULL,
  token       text        NOT NULL,
  platform    text        NOT NULL DEFAULT 'web',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_token
  ON device_tokens (token);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id
  ON device_tokens (user_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- 4. pg_cron: panggil edge function send-reminders setiap 23:00 UTC (06:00 WIB)
SELECT cron.schedule(
  'pintuasn-daily-reminders',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://kvnlpksrimhrckzqiufu.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body    := '{}'::jsonb
  ) AS request_id
  $$
);
