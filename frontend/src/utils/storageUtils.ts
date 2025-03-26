/**
 * Utilities for working with Supabase storage
 */

/**
 * Fix Supabase Storage URLs by handling various edge cases
 * and ensuring a consistent format.
 */
export const fixStorageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Don't modify already fixed URLs or local URIs
  if (url.startsWith('local-avatar://') || url.startsWith('file://')) {
    return url;
  }
  
  // Handle Supabase storage URLs
  if (url.includes('storage/v1/object/')) {
    // Clean and reformat the URL
    let cleanUrl = url;
    
    // Add cache busting to avoid stale cache issues
    if (!cleanUrl.includes('?')) {
      cleanUrl += `?t=${Date.now()}`;
    } else if (!cleanUrl.includes('t=')) {
      cleanUrl += `&t=${Date.now()}`;
    }
    
    return cleanUrl;
  }
  
  // Handle external URLs (no modification needed)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Default case: return the original URL
  return url;
};

/**
 * Get a direct download URL for an avatar image
 * This function transforms a storage URL to ensure it's directly accessible
 */
export const getDirectDownloadUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  const fixedUrl = fixStorageUrl(url);
  if (!fixedUrl) return '';
  
  // Already direct download URL
  if (fixedUrl.includes('download=true')) {
    return fixedUrl;
  }
  
  // Add download parameter
  if (fixedUrl.includes('?')) {
    return `${fixedUrl}&download=true`;
  } else {
    return `${fixedUrl}?download=true`;
  }
}; 