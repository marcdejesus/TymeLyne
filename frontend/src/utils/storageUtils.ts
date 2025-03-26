/**
 * Utilities for working with image storage
 */

/**
 * Fix image URLs by handling various edge cases
 */
export function getFixedImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  // Handle relative URLs from Django backend
  if (url.startsWith('/media/')) {
    // Get the API URL from environment or use a fallback
    const apiBaseUrl = process.env.API_URL || 'http://localhost:8000/api';
    const serverUrl = apiBaseUrl.replace('/api', '');
    return `${serverUrl}${url}`;
  }

  // If it's already a full URL, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a local file URI (e.g., from image picker), return it as is
  if (url.startsWith('file://')) {
    return url;
  }

  // Default case: assume it's a relative path and return it
  return url;
}

/**
 * Generate a placeholder avatar URL with initials
 */
export function generatePlaceholderAvatar(name: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  const backgroundColor = stringToColor(name);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=${backgroundColor.replace('#', '')}&color=fff&size=${size}`;
}

/**
 * Generate a consistent color from a string
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
} 