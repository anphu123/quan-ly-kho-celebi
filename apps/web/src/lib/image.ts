// Helpers for resolving image URLs from the backend
const getBackendOrigin = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;

  if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return envUrl.replace(/localhost|127\.0\.0\.1/, hostname).replace(/\/api\/v1\/?$/, '');
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/api\/v1\/?$/, '');
  }

  const port = 6868;
  return `http://${hostname}:${port}`;
};

const isAbsoluteUrl = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:');

export const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  if (isAbsoluteUrl(url)) return url;
  const base = getBackendOrigin();
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
};

export default resolveImageUrl;
