import { Platform } from 'react-native';

/**
 * На web вне localhost все запросы идут в in-memory моки (GitHub Pages без бэкенда).
 * Локальная разработка: webpack proxy → реальный API.
 * Принудительно выключить моки на web: localStorage TSYG_USE_REAL_API = "1"
 */
export function isApiMocked(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return false;
  try {
    if (window.localStorage?.getItem('TSYG_USE_REAL_API') === '1') return false;
  } catch {
    /* private mode */
  }
  return true;
}
