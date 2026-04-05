export type JwtClaims = {
  sub: string;
  role: string;
  user_id: number;
  exp: number;
};

export function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const json = atob(b64 + pad);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const c = decodeJwtPayload(token);
  if (!c?.exp) return true;
  return c.exp * 1000 <= Date.now();
}
