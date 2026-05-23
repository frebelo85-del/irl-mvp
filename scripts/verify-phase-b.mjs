#!/usr/bin/env node
/**
 * Loads EXPO_PUBLIC_* from repo root `.env`, signs in anonymously, checks missions readable (RLS).
 * Run after `supabase db push`.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

function loadEnv() {
  const path = join(repoRoot, ".env");
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    console.error("Missing .env at repo root; cannot verify.");
    process.exit(2);
  }
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  const url = vars.EXPO_PUBLIC_SUPABASE_URL ?? "";
  const anon = vars.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anon) {
    console.error("EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY required in .env");
    process.exit(2);
  }
  return { url, anon };
}

async function main() {
  const { url, anon } = loadEnv();
  const sb = createClient(url, anon, {
    auth: { persistSession: false },
  });

  const { error: anonErr } = await sb.auth.signInAnonymously();
  if (anonErr) {
    console.error("signInAnonymously:", anonErr.message);
    console.error("Enable Anonymous Sign-Ins on Supabase and retry.");
    process.exit(1);
  }

  const { count, error: mErr } = await sb
    .from("missions")
    .select("*", { count: "exact", head: true });

  if (mErr) {
    console.error("missions select:", mErr.message);
    process.exit(1);
  }
  console.log(`Missions readable (authenticated): count = ${count}`);

  if ((count ?? 0) < 10) {
    console.error(`Expected ≥ 10 missions, got ${count}`);
    process.exit(1);
  }

  const { data: sess } = await sb.auth.getUser();
  const uid = sess?.user?.id;
  if (!uid) {
    console.error("No user after anonymous sign-in");
    process.exit(1);
  }

  const { data: prof, error: pErr } = await sb
    .from("profiles")
    .select("id, onboarding_completed, account_linked_at")
    .eq("id", uid)
    .maybeSingle();

  if (pErr) {
    console.error("profiles:", pErr.message);
    process.exit(1);
  }
  if (!prof) {
    console.error("profiles: no row for new anonymous user — check handle_new_user trigger.");
    process.exit(1);
  }
  console.log("Profile bootstrap OK:", {
    onboarding_completed: prof.onboarding_completed,
    account_linked_at: prof.account_linked_at,
  });
  console.log("Phase B verification passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
