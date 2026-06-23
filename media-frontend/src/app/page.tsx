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
  searchParams?: Promise<{
    page?: string;
  }>;
};
export default async function Home({ searchParams }: any) {
  // 1. Attente des paramètres de l'URL (?category=...)
  const params = await searchParams;
  const page = Number.parseInt(params?.page ?? "1", 10);
  const pageSize = 20;

  // 2. Récupération de la catégorie cliquée
  const categoryFilter = params?.category || "";

  // 3. Construction du filtre pour Strapi
  const filters: any = {};
  if (categoryFilter) {
    filters.category = { slug: { $eq: categoryFilter } };
  }

  // 4. Récupération stable de toutes les données avec le filtre inclus
  const [articlesData, categoriesData, authorsData] = await Promise.all([
    getArticles({
      pagination: { page, pageSize },
      sort: "publishedAt:desc",
      filters: Object.keys(filters).length > 0 ? filters : undefined,
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
    <div className="bg-slate-50 min-h-screen text-gray-900">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* HEADER COHÉRENT ET SÉCURISÉ */}
        <div className="mb-10 border-b pb-6">
          
          {/* Liste des catégories affichée proprement juste au-dessus du titre */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-bold uppercase tracking-widest text-red-600">
              
              {/* Bouton "Tout" pour désélectionner le filtre */}
              <div className="flex items-center">
                <Link href="/" className={`hover:text-slate-900 transition hover:underline ${!categoryFilter ? 'underline text-slate-900 font-black' : ''}`}>
                  Tout
                </Link>
                <span className="ml-4 text-gray-300 font-normal select-none">•</span>
              </div>

              {categories.map((cat: any, index: number) => (
                <div key={cat.id || index} className="flex items-center">
                  <Link 
                    href={`/?category=${cat.slug}`} 
                    className={`hover:text-slate-900 transition hover:underline ${categoryFilter === cat.slug ? 'underline text-slate-900 font-black' : ''}`}
                  >
                    {cat.name}
                  </Link>
                  {index < categories.length - 1 && (
                    <span className="ml-4 text-gray-300 font-normal select-none">•</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black font-serif">
            L'Information Décryptée
          </h1>
        </div>

        <AdvancedSearchBar categories={categories} authors={authors} />

        {/* HERO */}
        {leadArticle && (
          <section className="mb-12">
            <Link href={`/articles/${leadArticle.slug}`}>
              <div className="relative h-[420px] rounded-xl overflow-hidden group shadow-sm bg-gray-200">
                {getImage(leadArticle) && (
                  <Image
                    src={getImage(leadArticle)}
                    alt={leadArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    priority
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-0 p-6 text-white max-w-3xl">
                  <span className="text-xs bg-red-600 px-2 py-1 uppercase font-bold tracking-wider rounded-sm">
                    À LA UNE
                  </span>

                  <h2 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
                    {leadArticle.title}
                  </h2>

                  <p className="mt-2 text-gray-200 line-clamp-2 text-sm md:text-base">
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
              <div className="group bg-white p-3 rounded-xl border border-gray-100 shadow-sm h-full transition hover:shadow-md">
                <div className="relative h-44 mb-3 overflow-hidden rounded-lg bg-gray-100">
                  {getImage(article) && (
                    <Image
                      src={getImage(article)}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  )}
                </div>

                <span className="text-xs text-red-600 uppercase font-semibold tracking-wide">
                  {getCategoryLabel(article)}
                </span>

                <h3 className="font-bold mt-1 group-hover:text-red-600 line-clamp-2 text-base transition">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </section>

        {/* FACT CHECK */}
        <section className="w-screen relative left-1/2 -ml-[50vw] my-16">
          <div className="bg-white border-y py-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <FactCheckPreview />
            </div>
          </div>
        </section>

        {/* MAIN FEED */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 font-serif border-b pb-2">
            Flux d’actualité
          </h2>

          <div className="space-y-8">
            {mainArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <div className="flex gap-6 border-b pb-6 group hover:bg-gray-50/50 p-2 rounded-lg transition">
                  
                  <div className="w-1/3 relative h-32 md:h-36 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                    {getImage(article) && (
                      <Image
                        src={getImage(article)}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    )}
                  </div>

                  <div className="w-2/3 flex flex-col justify-center">
                    <span className="text-xs text-red-600 uppercase font-semibold tracking-wide">
                      {getCategoryLabel(article)}
                    </span>

                    <h3 className="text-lg font-bold mt-1 group-hover:text-red-600 transition line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 mt-2 line-clamp-2 text-sm hidden md:block">
                      {getExcerpt(article)}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CATEGORIES SECTIONS */}
        <section className="space-y-16">
          {categories.map((cat: any) => {
            const catArticles = articles
              .filter((a) => a.category?.id === cat.id)
              .slice(0, 4);

            if (catArticles.length === 0) return null;

            return (
              <div key={cat.id} className="border-t pt-8 first:border-0 first:pt-0">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-800 border-l-4 border-red-600 pl-3">
                    {cat.name}
                  </h3>
                  <Link href={`/?category=${cat.slug}`} className="text-sm font-semibold text-red-600 hover:underline">
                    Voir plus →
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {catArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`}>
                      <div className="group flex flex-col h-full bg-white border rounded-xl p-3 shadow-sm transition hover:shadow-md">
                        <div className="relative h-36 mb-3 overflow-hidden rounded-lg bg-gray-100">
                          {getImage(article) && (
                            <Image
                              src={getImage(article)}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition duration-300"
                            />
                          )}
                        </div>
                        <span className="text-[11px] text-red-600 uppercase font-bold tracking-wide mb-1">
                          {getCategoryLabel(article)}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition mt-auto">
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