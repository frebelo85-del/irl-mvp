#!/usr/bin/env node
/**
 * Invoke send-push for a delivery id (Phase F smoke test).
 * Usage: CRON_SECRET=... node scripts/invoke-send-push.mjs <deliveryId>
 */
const deliveryId = process.argv[2];
const baseUrl =
  process.env.SUPABASE_URL?.replace(/\/$/, "") ??
  process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET;

if (!deliveryId) {
  console.error("Usage: node scripts/invoke-send-push.mjs <deliveryId>");
  process.exit(1);
}

if (!baseUrl || !cronSecret) {
  console.error(
    "Missing SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and CRON_SECRET.",
  );
  process.exit(1);
}

const url = `${baseUrl}/functions/v1/send-push`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${cronSecret}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ deliveryId }),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = text;
}

console.log("Status:", res.status);
console.log(JSON.stringify(json, null, 2));
process.exit(res.ok ? 0 : 1);
