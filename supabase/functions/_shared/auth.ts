/** Auth helpers for cron-triggered Edge Functions (verify_jwt = false). */

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

export function isAuthorizedCron(req: Request, cronSecret: string): boolean {
  const token = getBearerToken(req);
  return token !== null && token.length > 0 && token === cronSecret;
}

export function isAuthorizedServiceOrCron(
  req: Request,
  cronSecret: string,
  serviceRoleKey: string,
): boolean {
  const token = getBearerToken(req);
  if (!token) return false;
  return token === cronSecret || token === serviceRoleKey;
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
