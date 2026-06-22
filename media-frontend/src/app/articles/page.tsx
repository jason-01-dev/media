import { getArticles, getCategories, getAuthors } from "@/lib/strapi";
import { strapiImageUrlPrefer } from "@/lib/image";
import Link from "next/link";
import Image from "next/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";

export const metadata = {
  title: "| Actu 24",
  description: "Consultez tous nos articles d'actualités",
};

// 📝 Typage strict pour éviter les erreurs de soulignement TypeScript
interface ArticleData {
  id: number;
  title: string;
  slug: string;
  description?: string;
  publishedAt: string;
  cover?: {
    alternativeText?: string;
    url?: string;
    formats?: any;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  author?: {
    name: string;
  } | null;
}

type PageProps = Readonly<{
  searchParams?: Promise<{ page?: string; search?: string; category?: string; categories?: string; authors?: string; dateFrom?: string; dateTo?: string; urgent?: string; breaking?: string }>;
}>;

function buildArticleFilters(params: {
  search: string;
  category: string;
  categories: string[];
  authors: number[];
  dateFrom: string;
  dateTo: string;
  urgent: boolean;
  breaking: boolean;
}) {
  const filters: any = {};

  if (params.search) {
    filters.$or = [
      { title: { $containsi: params.search } },
      { description: { $containsi: params.search } },
    ];
  }

  if (params.category) {
    filters.category = { slug: { $eq: params.category } };
  }

  if (params.categories.length > 0) {
    filters.category = { slug: { $in: params.categories } };
  }

  if (params.authors.length > 0) {
    filters.author = { id: { $in: params.authors } };
  }

  const publishedAt: any = {};
  if (params.dateFrom) {
    publishedAt.$gte = params.dateFrom;
  }
  if (params.dateTo) {
    publishedAt.$lte = params.dateTo;
  }
  if (Object.keys(publishedAt).length > 0) {
    filters.publishedAt = publishedAt;
  }

  if (params.urgent) {
    filters.urgent = true;
  }

  if (params.breaking) {
    filters.breaking = true;
  }

  return filters;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params?.page ?? "1", 10);
  const pageSize = 12;
  const search = params?.search || "";
  const categoryFilter = params?.category || "";
  const categoriesFilter = params?.categories ? params.categories.split(',') : [];
  const authorsFilter = params?.authors ? params.authors.split(',').map(Number) : [];
  const dateFrom = params?.dateFrom || "";
  const dateTo = params?.dateTo || "";
  const urgent = params?.urgent === 'true';
  const breaking = params?.breaking === 'true';

  const filters = buildArticleFilters({
    search,
    category: categoryFilter,
    categories: categoriesFilter,
    authors: authorsFilter,
    dateFrom,
    dateTo,
    urgent,
    breaking,
  });

  const [articlesData, categoriesData, authorsData] = await Promise.all([
    getArticles({
      pagination: { page, pageSize },
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      // 🛠️ FIX : On a retiré la ligne 'populate' qui provoquait l'erreur TypeScript !
    }),
    getCategories(),
    getAuthors(),
  ]);

  const articles: ArticleData[] = articlesData?.data || [];
  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];
  const total = (articlesData as any)?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white">
      <main className="container mx-auto px-4 py-8">
        <section className="articles-section">
          <h1 className="section-title text-3xl font-bold mb-2">
            {search ? `Résultats pour "${search}"` : "Articles"}
          </h1>
          <p className="text-base text-gray-700 mb-8">Découvrez notre sélection complète d'actualités, reportages et analyses</p>

          <AdvancedSearchBar categories={categories} authors={authors} />

          {categories.length > 0 && (
            <div className="article-categories flex flex-wrap gap-2 my-6" aria-label="Catégories">
              {categories.map((c: any) => (
                <Link key={c.id} href={`/articles?category=${c.slug}`} className="category-pill bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-sm font-semibold transition">
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {articles.map((article) => {
                  const coverUrl = article.cover
                    ? strapiImageUrlPrefer(article.cover, ['large', 'medium', 'small', 'thumbnail'])
                    : null;
                  const href = article.slug ? `/articles/${article.slug}` : '#';
                  
                  return (
                    <Link key={article.id} href={href} className="group block h-full">
                      <article className="article-card-grid border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition h-full flex flex-col">
                        
                        <figure className="article-image relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                          {article.category && (
                            <span className="article-category">
                              {article.category.name}
                            </span>
                          )}
                          {coverUrl ? (
                            <Image
                              src={coverUrl}
                              alt={article.cover?.alternativeText || article.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                              Pas d'image
                            </div>
                          )}
                        </figure>

                        <div className="article-body p-4 flex flex-col flex-grow">
                          <h2 className="text-xl font-bold line-clamp-2 group-hover:text-red-600 transition mb-2">{article.title}</h2>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">{article.description}</p>
                          <footer className="article-meta flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3 mt-auto">
                            <span className="author font-medium text-gray-700">{article.author?.name || "Auteur inconnu"}</span>
                            <span className="date">
                              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }) : "--/--/----"}
                            </span>
                          </footer>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                queryParams={{
                  ...(search && { search }),
                  ...(categoryFilter && { category: categoryFilter }),
                  ...(categoriesFilter.length > 0 && { categories: categoriesFilter.join(',') }),
                  ...(authorsFilter.length > 0 && { authors: authorsFilter.join(',') }),
                  ...(dateFrom && { dateFrom }),
                  ...(dateTo && { dateTo }),
                  ...(urgent && { urgent: 'true' }),
                  ...(breaking && { breaking: 'true' }),
                }}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">Aucun article trouvé.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}