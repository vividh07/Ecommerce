export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'shop.theme';

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

export function readStoredTheme(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* ignore */
  }
  return 'dark';
}

/** Apply theme to <html>. Admin forced dark; seller forced light. */
export function applyDocumentTheme(
  preference: ThemePreference,
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
) {
  let resolved: ResolvedTheme = resolveTheme(preference);
  if (pathname.startsWith('/admin')) resolved = 'dark';
  if (pathname.startsWith('/seller')) resolved = 'light';

  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}
