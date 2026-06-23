import { Article, getArticles, getCategories, getAuthors } from "@/lib/strapi";
import FactCheckPreview from "@/components/FactCheckPreview";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrlPrefer } from "@/lib/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";

export const metadata = {
  title: "Actu 24 | Votre plateforme d'information",
};

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Home({ searchParams }: PageProps) {
  const page = Number.parseInt(searchParams?.page ?? "1", 10);
  const pageSize = 20;

  const [articlesData, categoriesData, authorsData] = await Promise.all([
    getArticles({
      pagination: { page, pageSize },
      sort: "publishedAt:desc",
    }),
    getCategories(),
    getAuthors(),
  ]);

  const articles: Article[] = articlesData?.data || [];
  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];

  const total = (articlesData as any)?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const leadArticle = articles[0];
  const topArticles = articles.slice(1, 4);
  const mainArticles = articles.slice(4);

  const getImage = (article: Article) =>
    strapiImageUrlPrefer(article.cover, ["large", "medium", "small"]) || "";

  const getExcerpt = (article: any) =>
    article.description || article.excerpt || article.summary || "";

  const getCategoryLabel = (article: Article) =>
    article.category?.name || "Actualité";

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* HEADER */}
        <div className="mb-10 border-b pb-6">
          <h1 className="text-4xl md:text-5xl font-black font-serif">
            L'Information Décryptée
          </h1>
        </div>

        <AdvancedSearchBar categories={categories} authors={authors} />

        {/* HERO */}
        {leadArticle && (
          <section className="mb-12">
            <Link href={`/articles/${leadArticle.slug}`}>
              <div className="relative h-[420px] rounded-xl overflow-hidden group">
                {getImage(leadArticle) && (
                  <Image
                    src={getImage(leadArticle)}
                    alt={leadArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute bottom-0 p-6 text-white">
                  <span className="text-xs bg-red-600 px-2 py-1 uppercase font-bold">
                    À LA UNE
                  </span>

                  <h2 className="text-3xl md:text-4xl font-bold mt-3">
                    {leadArticle.title}
                  </h2>

                  <p className="mt-2 text-gray-200 line-clamp-2">
                    {getExcerpt(leadArticle)}
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* TOP ARTICLES */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {topArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <div className="group">
                <div className="relative h-40 mb-3">
                  {getImage(article) && (
                    <Image
                      src={getImage(article)}
                      alt={article.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  )}
                </div>

                <span className="text-xs text-red-600 uppercase font-semibold">
                  {getCategoryLabel(article)}
                </span>

                <h3 className="font-bold mt-1 group-hover:text-red-600">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </section>

        {/* FACT CHECK */}
        <section className="mb-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <FactCheckPreview />
          </div>
        </section>

        {/* MAIN FEED */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 font-serif">
            Flux d’actualité
          </h2>

          <div className="space-y-10">
            {mainArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <div className="flex gap-6 border-b pb-6 hover:bg-gray-50">
                  
                  <div className="w-1/3 relative h-28">
                    {getImage(article) && (
                      <Image
                        src={getImage(article)}
                        alt={article.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    )}
                  </div>

                  <div className="w-2/3">
                    <span className="text-xs text-red-600 uppercase font-semibold">
                      {getCategoryLabel(article)}
                    </span>

                    <h3 className="text-lg font-bold mt-1">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 mt-2 line-clamp-2 text-sm">
                      {getExcerpt(article)}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="space-y-14">
          {categories.slice(0, 3).map((cat: any) => {
            const catArticles = articles
              .filter((a) => a.category?.id === cat.id)
              .slice(0, 4);

            if (catArticles.length === 0) return null;

            return (
              <div key={cat.id}>
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold font-serif">
                    {cat.name}
                  </h3>
                  <Link href={`/?category=${cat.slug}`}>
                    Voir plus →
                  </Link>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  {catArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`}>
                      <div>
                        <div className="relative h-32 mb-2">
                          {getImage(article) && (
                            <Image
                              src={getImage(article)}
                              alt={article.title}
                              fill
                              className="object-cover rounded"
                            />
                          )}
                        </div>
                        <h4 className="text-sm font-semibold">
                          {article.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            );
          })}
        </section>

        {/* PAGINATION */}
        <div className="mt-16">
          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
          />
        </div>

      </main>
    </div>
  );
}