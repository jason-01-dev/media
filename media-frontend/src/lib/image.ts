import { StrapiImage } from './strapi';

function joinBase(base: string, path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Returns a properly constructed image URL from Strapi media object.
 * Prefers a specific format if available.
 */
export function strapiImageUrl(image: unknown | undefined | null, format?: string): string | null {
  if (!image) return null;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const getAttrs = (obj: any) => obj?.attributes || obj?.data?.attributes || obj || {};

  const attrs = getAttrs(image);

  // Try requested format first
  if (format && attrs.formats?.[format]?.url) {
    return joinBase(base, attrs.formats[format].url);
  }

  // Fallback to other common formats
  const formats = attrs.formats || {};
  const preferred = ['large', 'medium', 'small', 'thumbnail'];
  for (const f of preferred) {
    if (formats[f]?.url) return joinBase(base, formats[f].url);
  }

  if (attrs.url) return joinBase(base, attrs.url);

  // Direct url fallback on raw object (cast safely)
  const raw = image as Record<string, unknown>;
  if (raw?.url && typeof raw.url === 'string') return joinBase(base, raw.url);

  return null;
}

/** Prefer specific formats, then fall back gracefully */
export function strapiImageUrlPrefer(image: unknown, preferredFormats: string[] = ['large', 'medium', 'small']): string | null {
  for (const f of preferredFormats) {
    const url = strapiImageUrl(image, f);
    if (url) return url;
  }
  return strapiImageUrl(image);
}

/**
 * Helper for Next.js Image props (width/height).
 * Returns sensible defaults when formats not present.
 */
export function getImageDimensions(image: any, fallbackWidth = 1200, fallbackHeight = 630) {
  const attrs = image?.attributes || image?.data?.attributes || image || {};
  const format = attrs.formats?.large || attrs.formats?.medium || attrs;
  return {
    width: format?.width || fallbackWidth,
    height: format?.height || fallbackHeight,
  };
}
