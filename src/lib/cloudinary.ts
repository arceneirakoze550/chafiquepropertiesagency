/**
 * Cloudinary Media & Optimization Utilities for Chafique Property Agency
 * Upload Preset: chafique_properties
 * Target Folder: chafique-property-agency/properties
 */

export const CLOUDINARY_UPLOAD_PRESET = 'chafique_properties';
export const CLOUDINARY_FOLDER = 'chafique-property-agency/properties';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit';
  quality?: 'auto' | 'auto:good' | 'auto:eco' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  aspectRatio?: string;
  gravity?: 'auto' | 'center' | 'face';
}

/**
 * Transforms a Cloudinary URL to deliver optimized responsive images.
 * If the image is not from Cloudinary (e.g. external unsplash), it applies standard query parameters where possible.
 */
export const getOptimizedImageUrl = (
  url: string,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!url) return '';

  // Check if it is a Cloudinary URL
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
      gravity = 'auto',
      aspectRatio,
    } = options;

    const transformations: string[] = [`f_${format}`, `q_${quality}`];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (gravity && (crop === 'fill' || crop === 'thumb')) transformations.push(`g_${gravity}`);
    if (aspectRatio) transformations.push(`ar_${aspectRatio}`);

    const transformString = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  // If unsplash image fallback, optimize via URL query params
  if (url.includes('images.unsplash.com')) {
    const u = new URL(url);
    if (options.width) u.searchParams.set('w', String(options.width));
    if (options.height) u.searchParams.set('h', String(options.height));
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    u.searchParams.set('q', '80');
    return u.toString();
  }

  return url;
};

/**
 * Generate a responsive srcSet string for Cloudinary images
 */
export const getCloudinarySrcSet = (
  url: string,
  widths: number[] = [400, 800, 1200, 1600]
): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w, crop: 'fill' })} ${w}w`)
    .join(', ');
};
