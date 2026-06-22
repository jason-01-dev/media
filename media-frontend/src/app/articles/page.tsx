import { getArticles, getCategories, getAuthors } from "@/lib/strapi";
import { strapiImageUrlPrefer } from "@/lib/image";
import Link from "next/link";
import Image from "next/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";

export const metadata = {
  title: "Articles | Actu 24",
  description: "Consultez tous nos articles d'actualités",
};

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
  searchParams?: Promise<{
    page?: string;
    search?: string;
    category?: string;
    categories?: string;
    authors?: string;
    dateFrom?: string;
    dateTo?: string;
    urgent?: string;
    breaking?: string;
  }>;
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
  const categoriesFilter = params?.categories ? params.categories.split(",") : [];
  const authorsFilter = params?.authors ? params.authors.split(",").map(Number) : [];
  const dateFrom = params?.dateFrom || "";
  const dateTo = params?.dateTo || "";
  const urgent = params?.urgent === "true";
  const breaking = params?.breaking === "true";

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

  const articles: ArticleData[] = articlesData?.data || [];
  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];
  const total = (articlesData as any)?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <section>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {search ? `Résultats pour "${search}"` : "Articles"}
          </h1>
          <p className="text-gray-500 text-base mb-8">
            Découvrez notre sélection complète d'actualités, reportages et analyses
          </p>

          <AdvancedSearchBar categories={categories} authors={authors} />

          {/* BARRE DES CATÉGORIES FLOTTANTES */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 my-6" aria-label="Catégories">
              {categories.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/articles?category=${c.slug}`}
                  className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-1.5 rounded-full text-sm font-semibold transition duration-200"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {/* GRILLE D'ARTICLES PILOTÉE PAR TON CSS */}
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {articles.map((article) => {
                  const coverUrl = article.cover
                    ? strapiImageUrlPrefer(article.cover, ["large", "medium", "small", "thumbnail"])
                    : null;
                  const href = article.slug ? `/articles/${article.slug}` : "#";

                  return (
                    <Link key={article.id} href={href} className="group block h-full">
                      <article className="article-card-grid">
                        
                        {/* 1. Zone Image verrouillée par le CSS */}
                        <div className="article-image-wrapper">
                          {article.category && (
                            <span className="article-grid-badge">
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
                              priority={page === 1}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                              Pas d'image
                            </div>
                          )}
                        </div>

                        {/* 2. Zone Contenu Texte gérée par le CSS */}
                        <div className="article-body">
                          <h2>{article.title}</h2>
                          <p>{article.description}</p>

                          {/* 3. Pied de page de la carte (Auteur + Date) collé en bas */}
                          <footer className="article-card-footer">
                            <span className="article-card-author">
                              {article.author?.name || "Rédaction"}
                            </span>
                            <span>
                              {article.publishedAt
                                ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "--/--/----"}
                            </span>
                          </footer>
                        </div>

                      </article>
                    </Link>
                  );
                })}
              </div>

              {/* COMPOSANT DE PAGINATION */}
              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                queryParams={{
                  ...(search && { search }),
                  ...(categoryFilter && { category: categoryFilter }),
                  ...(categoriesFilter.length > 0 && { categories: categoriesFilter.join(",") }),
                  ...(authorsFilter.length > 0 && { authors: authorsFilter.join(",") }),
                  ...(dateFrom && { dateFrom }),
                  ...(dateTo && { dateTo }),
                  ...(urgent && { urgent: "true" }),
                  ...(breaking && { breaking: "true" }),
                }}
              />
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200 mt-8">
              <p className="text-xl text-gray-600">Aucun article trouvé.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}