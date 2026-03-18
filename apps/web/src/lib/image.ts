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


export const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  // data/blob URLs are already usable as-is
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const base = getBackendOrigin();
  // Absolute http/https URL — replace hostname if it's localhost and we're not on localhost
  // (handles old records stored before relative-path fix)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, base);
    }
    return url;
  }
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
};

export default resolveImageUrl;
