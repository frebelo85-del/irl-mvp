#!/usr/bin/env node
/**
 * Invoke schedule-deliveries (Phase F manual test).
 * Requires env: SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL), CRON_SECRET
 */
const baseUrl =
  process.env.SUPABASE_URL?.replace(/\/$/, "") ??
  process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET;

if (!baseUrl || !cronSecret) {
  console.error(
    "Missing SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and CRON_SECRET in environment.",
  );
  process.exit(1);
}

const url = `${baseUrl}/functions/v1/schedule-deliveries`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${cronSecret}`,
    "Content-Type": "application/json",
  },
  body: "{}",
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
