# Media Frontend - Next.js 16 + Strapi Integration

Full-featured Next.js frontend integrated with Strapi CMS backend.

## Features

✅ **Server-Side Rendering (SSR)** — Dynamic pages fetched from Strapi  
✅ **Static Site Generation (SSG)** — Article pages pre-rendered with ISR  
✅ **TypeScript** — Full type safety for Strapi API responses  
✅ **Tailwind CSS** — Modern, responsive design  
✅ **Image Optimization** — Next.js Image component for cover photos & avatars  
✅ **SEO Ready** — Dynamic metadata from Strapi content  

## Setup

### 1. Install Dependencies

```bash
cd media-frontend
npm install
```

### 2. Configure Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=your_api_token_here
NEXT_PUBLIC_API_URL=http://localhost:1337/api
```

**To get your token:**
1. Open Strapi Admin: http://localhost:1337/admin
2. Go to Settings → API Tokens
3. Create a new token (Name: "Frontend-ReadOnly", Type: "Read-only")
4. Copy the token and paste into `.env.local`

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with header/footer
│   ├── page.tsx            # Home page (hero + recent articles)
│   ├── articles/
│   │   ├── page.tsx        # Articles list page
│   │   └── [slug]/
│   │       └── page.tsx    # Individual article page (SSG)
│   ├── about/
│   │   └── page.tsx        # About page
│   └── globals.css         # Global Tailwind styles
└── lib/
    └── strapi.ts           # Strapi API client & types
```

## API Integration

### Main Pages

| Page | Route | Data Source |
|------|-------|-------------|
| Home | `/` | Global + Latest 6 articles |
| Articles List | `/articles` | All articles (paginated) |
| Article Detail | `/articles/[slug]` | Single article by slug (SSG) |
| About | `/about` | About content-type |

### Strapi Queries

All API calls are in `src/lib/strapi.ts`:

- `getArticles(options)` — Fetch articles with filters/pagination
- `getArticleBySlug(slug)` — Fetch single article by slug
- `getAuthors()` — Fetch all authors
- `getCategories()` — Fetch all categories
- `getGlobal()` — Fetch global settings (site name, description, etc.)
- `getAbout()` — Fetch about page content

### Response Types

Full TypeScript types are defined in `src/lib/strapi.ts`:

```typescript
interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  cover?: StrapiImage;
  author?: Author;
  category?: Category;
  blocks?: unknown[]; // Dynamic content blocks
  publishedAt: string;
}
```

## Building for Production

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

## Performance Features

- **ISR (Incremental Static Regeneration)** — Articles revalidate every 60 seconds
- **Image Optimization** — Automatic image resize & WebP conversion
- **Lazy Loading** — Images load only when needed
- **CSS Optimization** — Tailwind purges unused styles

## Debugging

### Check Strapi Connection

```bash
curl http://localhost:1337/api/articles
```

### Check Token Validity

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:1337/api/articles
```

### View OpenAPI Documentation

http://localhost:1337/documentation

## Troubleshooting

### "Failed to fetch from Strapi"

1. Ensure Strapi is running: `cd media-cms && npm run develop`
2. Check `.env.local` has correct `NEXT_PUBLIC_STRAPI_URL`
3. Verify token is valid in Strapi Admin

### "Images not loading"

1. Check cover image URLs in Strapi Admin
2. Ensure image files exist in `media-cms/public/uploads/`
3. Verify `NEXT_PUBLIC_STRAPI_URL` is correct in `.env.local`

### Build failing

1. Clear cache: `rm -rf .next`
2. Reinstall: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npx tsc --noEmit`

## Next Steps

- **Add Search** — Implement full-text search using Strapi filters
- **Add Comments** — Use Users-Permissions plugin for comment system
- **Add Newsletter** — Integrate email signup
- **Deploy** — Push to Vercel, Netlify, or self-hosted server
- **CDN** — Add image CDN (Cloudinary, Imgix) for optimization

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Strapi Docs](https://docs.strapi.io)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Strapi SDK JS](https://github.com/strapi/strapi-sdk-js)
