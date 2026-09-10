export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Некорректный формат токена');

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );

  return JSON.parse(json) as T;
}
