import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export function createUserClient(req: Request): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const authHeader = req.headers.get("Authorization");

  if (!url || !anonKey || !authHeader) {
    return null;
  }

  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}

export async function getUserIdFromRequest(
  req: Request,
): Promise<string | null> {
  const client = createUserClient(req);
  if (!client) return null;

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}
