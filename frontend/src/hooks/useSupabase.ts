/**
 * Fixes Supabase storage URLs to work around CORS issues
 * by trying different endpoint formats and adding cache busting
 */
export const getFixedStorageUrl = (url: string): string => {
  if (!url || !url.includes('supabase.co/storage')) {
    return url;
  }

  // Create a properly formatted URL with cache busting
  const cacheBuster = `t=${Date.now()}`;
  let fixedUrl = url;
  
  // Try alternative direct URL format for Supabase storage
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Attempt to use direct storage URL format which might bypass CORS
    const projectRef = url.split('.supabase.co')[0].split('//')[1];
    const pathMatch = url.match(/\/public\/(.+)/);
    
    if (projectRef && pathMatch && pathMatch[1]) {
      // Use the render endpoint which might work better with CORS
      fixedUrl = `https://${projectRef}.supabase.co/storage/v1/render/image/public/${pathMatch[1]}`;
      console.log('Using direct render URL for Supabase storage:', fixedUrl);
    }
  }
  
  // Add cache busting parameter
  fixedUrl = fixedUrl.includes('?') 
    ? `${fixedUrl}&${cacheBuster}` 
    : `${fixedUrl}?${cacheBuster}`;
  
  return fixedUrl;
}; 