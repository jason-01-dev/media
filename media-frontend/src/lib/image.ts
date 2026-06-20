import { StrapiImage } from './strapi';

function joinBase(base: string, path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function strapiImageUrl(image: any | undefined | null, format?: string): string | null {
  if (!image) return null;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Strapi v4: { data: { attributes: { url, formats } } }
  if (image.data) {
    const data = image.data;
    const attrs = data.attributes || data;
    // if a specific format is requested (thumbnail, small, medium, large, etc.)
    if (format && attrs.formats && (attrs.formats as any)[format]) {
      const f = (attrs.formats as any)[format];
      if (f && f.url) return joinBase(base, f.url as string);
    }
    if (attrs.url) return joinBase(base, attrs.url as string);
  }

  // Strapi v5 or flattened: image.attributes or direct fields
  const attrs = image.attributes || image;
  if (format && attrs.formats && (attrs.formats as any)[format]) {
    const f = (attrs.formats as any)[format];
    if (f && f.url) return joinBase(base, f.url as string);
  }
  if (attrs.url) return joinBase(base, attrs.url as string);

  if (image.url) return joinBase(base, image.url as string);

  return null;
}

// Helper to prefer a format and fallback to original
export function strapiImageUrlPrefer(image: any, preferredFormats: string[]): string | null {
  for (const f of preferredFormats) {
    const url = strapiImageUrl(image, f);
    if (url) return url;
  }
  return strapiImageUrl(image);
}
