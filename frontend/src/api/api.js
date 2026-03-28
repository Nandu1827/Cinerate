/** Backend origin (no /api). Local: default localhost. Production build: set in .env.production or host env. */
export const API_ORIGIN = (process.env.REACT_APP_API_ORIGIN || 'http://localhost:15400').replace(
  /\/$/,
  ''
);

export const API_URL = `${API_ORIGIN}/api`;

export function posterUrl(poster) {
  if (!poster) return '/default-poster.jpg';
  if (poster.startsWith('http')) return poster;
  return `${API_ORIGIN}${poster.startsWith('/') ? '' : '/'}${poster}`;
}
