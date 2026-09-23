import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('accessToken', access);
  else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

export function clearSession() {
  setTokens(null, null);
}

function isAuthBootstrapUrl(url: string) {
  return (
    url.includes('/auth/refresh') ||
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/google')
  );
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // Let the browser set multipart boundary for FormData uploads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Content-Type', false as unknown as string);
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
    }
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as
      | (typeof error.config & { _retry?: boolean; url?: string })
      | undefined;
    if (!original) return Promise.reject(error);

    const url = String(original.url || '');
    const shouldTryRefresh =
      error.response?.status === 401 &&
      Boolean(refreshToken) &&
      !original._retry &&
      !isAuthBootstrapUrl(url);

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshing) {
      const currentRefresh = refreshToken;
      refreshing = api
        .post('/auth/refresh', { refreshToken: currentRefresh })
        .then((res) => {
          const { accessToken: at, refreshToken: rt } = res.data.data;
          setTokens(at, rt);
          return at as string;
        })
        .catch(() => {
          clearSession();
          return null;
        })
        .finally(() => {
          refreshing = null;
        });
    }

    const newToken = await refreshing;
    if (newToken) {
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);

export type ApiListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
