import { dispatchMockApi } from './mockApiHandlers';
import { isApiMocked } from './mockMode';

/** Подставляется при web-сборке (webpack DefinePlugin), иначе дефолт. */
const RAILWAY_API =
  process.env.PUBLIC_API_URL || 'https://tsyganestan-production.up.railway.app';

/** В браузере на localhost webpack-dev-server проксирует /auth, /tours, /users на API. */
function resolveApiBase(): string {
  const host =
    typeof window !== 'undefined' ? window.location?.hostname : undefined;
  if (host === 'localhost' || host === '127.0.0.1') {
    return '';
  }
  return RAILWAY_API;
}

const API_BASE_URL = resolveApiBase();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** instanceof ломается при дублировании класса в чанках — для UI используем это. */
export function getRequestErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  if (
    e !== null &&
    typeof e === 'object' &&
    'name' in e &&
    (e as { name: string }).name === 'ApiError' &&
    'message' in e
  ) {
    return String((e as { message: string }).message);
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  if (isApiMocked()) {
    const mock = dispatchMockApi<T>(path, options, token);
    if (!mock.ok) throw new ApiError(mock.status, mock.message);
    return mock.data;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      const d = body.detail;
      if (typeof d === 'string') message = d;
      else if (Array.isArray(d))
        message = d.map((x: { msg?: string }) => x.msg).filter(Boolean).join(', ') || message;
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}
