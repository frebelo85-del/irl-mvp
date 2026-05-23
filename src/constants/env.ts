/** Read EXPO_PUBLIC_* at runtime (Expo injects from .env via Metro). */

export function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  configured: boolean;
} {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const configured = Boolean(url.trim() && anonKey.trim());
  return { url: url.trim(), anonKey: anonKey.trim(), configured };
}

export function maskUrlPreview(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "(empty)";
  try {
    const withProto = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const host = new URL(withProto).hostname;
    const head = host.slice(0, 8);
    return `${head}…`;
  } catch {
    const s = trimmed.replace(/^https?:\/\//i, "");
    const head = s.slice(0, 8);
    return head ? `${head}…` : "(invalid)";
  }
}

export function maskAnonKeyPreview(key: string): string {
  if (!key.trim()) return "(empty)";
  return `${key.slice(0, 8)}…`;
}
