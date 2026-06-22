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
    }),
    getCategories(),
    getAuthors(),
  ]);

  const articles = articlesData?.data || [];
  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];
  const total = (articlesData as any)?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white">
      <main className="container">
        <section className="articles-section">
          <h1 className="section-title">
            {search ? `Résultats pour "${search}"` : "Articles"}
          </h1>
          <p className="text-base text-gray-700 mb-8">Découvrez notre sélection complète d'actualités, reportages et analyses</p>

          <AdvancedSearchBar categories={categories} authors={authors} />

          {categories.length > 0 && (
            <div className="article-categories" aria-label="Catégories">
              {categories.map((c: any) => (
                <a key={c.id} href={`/articles?category=${c.slug}`} className="category-pill">{c.name}</a>
              ))}
            </div>
          )}

          {articles.length > 0 ? (
            <>
              <div className="articles-grid mt-8">
                {articles.map((article) => {
                  const coverUrl = article.cover
                    ? strapiImageUrlPrefer(article.cover, ['medium', 'small', 'thumbnail'])
                    : null;
                  const href = article.slug ? `/articles/${article.slug}` : '#';
                  return (
                    <Link key={article.id} href={href}>
                      <article className="article-card-grid">
                        <figure className="article-image">
                          {coverUrl ? (
                            <Image
                              src={coverUrl}
                              alt={article.cover?.alternativeText || article.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                              Pas d'image
                            </div>
                          )}
                          {article.category && (
                            <figcaption className="article-category">
                              {article.category.name}
                            </figcaption>
                          )}
                        </figure>
                        <div className="article-body">
                          <h2>{article.title}</h2>
                          <p>{article.description}</p>
                          <footer className="article-meta">
                            <span className="author">{article.author?.name || "Auteur inconnu"}</span>
                            <span className="date">
                              {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
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
