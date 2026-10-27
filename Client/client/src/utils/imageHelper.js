const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

/**
 * Returns the correct URL for an image.
 * If the path is already a full URL (from Cloudinary), it returns it as-is.
 * If the path is a relative path (old local uploads), it prepends IMAGE_BASE_URL.
 * 
 * @param {string} path - The image path or URL
 * @returns {string} - The full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  
  // If it's already a full URL, data URL, blob, or Vite asset, return it as-is
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:") ||
    path.startsWith("/src/") ||
    path.startsWith("/@") ||
    path.startsWith("/assets/")
  ) {
    return path;
  }
  
  // Otherwise, prepend the base URL (for old /uploads/ paths)
  return `${IMAGE_BASE_URL}${path}`;
};
