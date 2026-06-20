/**
 * Strapi API Types & Queries
 */

export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: {
      name: string;
      hash: string;
      ext: string;
      mime: string;
      path?: string;
      width: number;
      height: number;
      size: number;
      url: string;
    };
    small?: Record<string, unknown>;
    medium?: Record<string, unknown>;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: number;
  documentId: string;
  name: string;
  email: string;
  avatar?: StrapiImage;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  description: string;
  body?: string;
  slug: string;
  cover?: StrapiImage;
  author?: Author;
  category?: Category;
  blocks?: unknown[];
  featured?: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Global {
  id: number;
  documentId: string;
  siteName: string;
  siteDescription: string;
  defaultSeo?: {
    metaTitle: string;
    metaDescription: string;
  };
  favicon?: StrapiImage;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface About {
  id: number;
  documentId: string;
  title: string;
  blocks?: unknown[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/**
 * Build Strapi Query Params
 */
interface QueryOptions {
  populate?: string | string[];
  filters?: Record<string, unknown>;
  sort?: string | string[];
  fields?: string[];
  pagination?: { page: number; pageSize: number };
  locale?: string;
}

function buildQueryString(options: QueryOptions): string {
  const params = new URLSearchParams();

  // populate: Strapi v5 requires separate populate parameters, not comma-separated
  if (options.populate) {
    const populate = Array.isArray(options.populate)
      ? options.populate
      : [options.populate];
    populate.forEach((p) => params.append('populate', p));
  }

  // filters: Strapi v5 expects filters[fieldName][$operator]=value format
  if (options.filters) {
    const buildFilters = (obj: any, prefix: string = 'filters') => {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        
        // Check if this is an operator (starts with $)
        if (key.startsWith('$')) {
          // Operator found - add to params
          params.append(prefix, String(value));
        } else if (typeof value === 'object' && value !== null) {
          // Nested object - recurse
          buildFilters(value, `${prefix}[${key}]`);
        } else {
          // Simple value
          params.append(`${prefix}[${key}]`, String(value));
        }
      }
    };
    
    buildFilters(options.filters);
  }

  if (options.sort) {
    const sort = Array.isArray(options.sort) ? options.sort : [options.sort];
    sort.forEach((s) => {
      // Convert Strapi v4 format (-field) to v5 format (field:desc)
      const converted = s.startsWith('-') ? `${s.slice(1)}:desc` : s;
      params.append('sort', converted);
    });
  }

  if (options.pagination) {
    params.append('pagination[page]', options.pagination.page.toString());
    params.append('pagination[pageSize]', options.pagination.pageSize.toString());
  }

  if (options.locale) {
    params.append('locale', options.locale);
  }

  return params.toString();
}

/**
 * Fetch from Strapi API
 */
/**
 * Fetch from Strapi API
 */
function buildStrapiUrl(base: string, path: string, options?: QueryOptions): string {
  const apiBase = new URL('/api/', base.endsWith('/') ? base : base + '/');
  const url = new URL(path.replace(/^\/+/, ''), apiBase);

  if (options) {
    const q = buildQueryString(options);
    if (q) url.search = q;
  }

  return url.toString();
}

function buildStrapiHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token && token !== 'your_api_token_here') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function getCurrentHost(): string | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  return (globalThis as any).location?.hostname;
}

async function fetchStrapi<T>(path: string, options?: QueryOptions): Promise<T | null> {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  let fullUrlString = ''; // Déclarée ici pour être accessible aussi dans le catch

  try {
    fullUrlString = buildStrapiUrl(base, path, options);
    const headers = buildStrapiHeaders(token);

    console.log('🌐 Fetching from:', fullUrlString);
    const res = await fetch(fullUrlString, {
      method: 'GET',
      headers,
    });
    console.log('📡 Response status:', res.status);

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    return payload as T;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Strapi fetch error:', errorMessage);
    console.error('❌ Full error:', err);

    const currentHost = getCurrentHost();
    if (currentHost) {
      console.error('🌍 Attempted URL:', base);
      console.error('📍 Current hostname:', currentHost);
      console.error('🔗 Full constructed URL:', fullUrlString || 'URL non construite');
    }

    return null;
  }
}

/**
 * API Queries
 */

export async function getArticles(options?: Omit<QueryOptions, 'populate'>): Promise<{ data: Article[] } | null> {
  return fetchStrapi('/articles', {
    populate: ['author', 'category', 'cover', 'author.avatar'],
    sort: '-createdAt',
    ...options,
  });
}

export async function getArticleBySlug(slug: string): Promise<{ data: Article[] } | null> {
  return fetchStrapi('/articles', {
    populate: ['author', 'category', 'cover', 'blocks', 'author.avatar'],
    filters: { slug: { $eq: slug } },
    fields: ['title', 'slug', 'description', 'body', 'publishedAt', 'updatedAt', 'createdAt'],
  });
}

export async function getAuthors(): Promise<{ data: Author[] } | null> {
  return fetchStrapi('/authors', {
    populate: ['avatar'],
  });
}

export async function getCategories(): Promise<{ data: Category[] } | null> {
  return fetchStrapi('/categories');
}

export async function getGlobal(): Promise<{ data: Global } | null> {
  return fetchStrapi('/globals', {
    populate: ['defaultSeo', 'favicon'],
  });
}

export async function getAbout(): Promise<{ data: About } | null> {
  return fetchStrapi('/abouts', {
    populate: ['blocks'],
  });
}

export async function getFactChecks(): Promise<{ data: Array<{ id: number; attributes: { claim: string; verdict: string; source?: string; body?: string; media?: StrapiImage; note?: string; featured?: boolean; breaking?: boolean; urgent?: boolean } }> } | null> {
  // Strapi collection route for the new content type `fact-check` (plural: fact-checks)
  return fetchStrapi('/fact-checks', {
    populate: ['media'],
    sort: '-createdAt',
  });
}
