// supabase/functions/send-reminders/index.ts
// Dipanggil oleh pg_cron setiap hari pukul 23:00 UTC (= 06:00 WIB)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface ServiceAccount {
  project_id:   string;
  private_key:  string;
  client_email: string;
}

interface ReminderPref {
  user_id:       string;
  interval_days: number | null;
  custom_days:   number[] | null;
  last_notif_at: string | null;
}

// ── Helpers: Google OAuth2 via JWT ───────────────────────────
function base64url(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getFirebaseAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header  = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss:   sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  };

  const sigInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  const pem = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, '')
    .replace(/\n/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8', der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign'],
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', key,
    new TextEncoder().encode(sigInput),
  );

  const jwt = `${sigInput}.${base64url(sig)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

// ── Kirim satu FCM message ────────────────────────────────────
async function sendFCM(
  fcmToken:    string,
  projectId:   string,
  accessToken: string,
  appUrl:      string,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: '🎯 Waktunya Latihan SKD!',
            body:  'Jangan lewatkan sesi belajar hari ini. Konsistensi adalah kunci kelulusan!',
          },
          webpush: {
            fcm_options: { link: `${appUrl}/roadmap` },
          },
        },
      }),
    },
  );
  return { ok: res.ok, status: res.status };
}

// ── Due-date check ────────────────────────────────────────────
function isDue(pref: ReminderPref): boolean {
  const now = new Date();

  if (pref.interval_days !== null) {
    // Interval-based
    if (!pref.last_notif_at) return true;
    const last = new Date(pref.last_notif_at);
    const due  = new Date(last.getTime() + pref.interval_days * 86_400_000);
    return now >= due;
  }

  if (pref.custom_days?.length) {
    // Custom hari — cek hari ini (0=Min, 1=Sen, ..., 6=Sab, sesuai JS DOW)
    const todayDow = now.getUTCDay();
    return pref.custom_days.includes(todayDow);
  }

  return false;
}

// ── Main handler ──────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Auth: cek X-Cron-Secret jika di-set, fallback allow jika belum di-set
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret) {
    const incoming = req.headers.get('X-Cron-Secret') ?? '';
    if (incoming !== cronSecret) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // FCM Service Account (set di Supabase Dashboard → Edge Functions → Secrets)
  const saJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!saJson) {
    return new Response('FIREBASE_SERVICE_ACCOUNT_JSON secret not set', { status: 500 });
  }

  const sa: ServiceAccount = JSON.parse(saJson);
  const appUrl         = Deno.env.get('APP_URL') ?? 'https://pintuasn.vercel.app';
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase       = createClient(supabaseUrl, serviceRoleKey);

  // Ambil semua user yang reminder-nya aktif
  const { data: prefs, error: prefsErr } = await supabase
    .from('user_reminder_preferences')
    .select('user_id, interval_days, custom_days, last_notif_at')
    .eq('enabled', true);

  if (prefsErr) {
    return new Response(JSON.stringify({ error: prefsErr.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const dueUsers = (prefs as ReminderPref[] ?? []).filter(isDue);

  if (dueUsers.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0, message: 'No users due today' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Dapatkan FCM access token sekali untuk semua kiriman
  let accessToken: string;
  try {
    accessToken = await getFirebaseAccessToken(sa);
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  let sent        = 0;
  let skipped     = 0;
  const deadIds: string[] = [];
  const now       = new Date().toISOString();

  for (const pref of dueUsers) {
    const { data: tokens } = await supabase
      .from('device_tokens')
      .select('id, token')
      .eq('user_id', pref.user_id);

    if (!tokens || tokens.length === 0) { skipped++; continue; }

    for (const dt of tokens as { id: string; token: string }[]) {
      const result = await sendFCM(dt.token, sa.project_id, accessToken, appUrl);
      if (result.ok) {
        sent++;
      } else if (result.status === 404 || result.status === 410) {
        deadIds.push(dt.id); // token expired / unregistered
      }
    }

    // Perbarui last_notif_at
    await supabase
      .from('user_reminder_preferences')
      .update({ last_notif_at: now })
      .eq('user_id', pref.user_id);
  }

  // Bersihkan token mati
  if (deadIds.length > 0) {
    await supabase.from('device_tokens').delete().in('id', deadIds);
  }

  return new Response(
    JSON.stringify({
      sent,
      skipped,
      deadCleaned: deadIds.length,
      dueUsers:    dueUsers.length,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
