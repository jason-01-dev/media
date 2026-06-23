import { Article, getArticles, getCategories, getAuthors } from "@/lib/strapi";
import HomeGrid from "@/components/HomeGrid";
import FactCheckPreview from "@/components/FactCheckPreview";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrlPrefer } from "@/lib/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";

export const metadata = {
  title: "Actu 24 | Votre plateforme d'information en temps réel",
  description: "Découvrez notre sélection complète d'actualités, reportages et analyses.",
};

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
  if (params.category) filters.category = { slug: { $eq: params.category } };
  if (params.categories.length > 0) filters.category = { slug: { $in: params.categories } };
  if (params.authors.length > 0) filters.author = { id: { $in: params.authors } };

  const publishedAt: any = {};
  if (params.dateFrom) publishedAt.$gte = params.dateFrom;
  if (params.dateTo) publishedAt.$lte = params.dateTo;
  if (Object.keys(publishedAt).length > 0) filters.publishedAt = publishedAt;

  if (params.urgent) filters.urgent = true;
  if (params.breaking) filters.breaking = true;

  return filters;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params?.page ?? "1", 10);
  // Augmentation de la taille pour récupérer assez d'articles à distribuer par catégories sur la page d'accueil
  const pageSize = 40; 
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

  const isDefaultHome = page === 1 && !search && !categoryFilter;

  const [articlesData, featuredData, categoriesData, authorsData] = await Promise.all([
    getArticles({
      pagination: { page, pageSize },
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: 'publishedAt:desc',
    }),
    getArticles({
      filters: { featured: { $eq: true } },
      sort: 'publishedAt:desc',
      pagination: { page: 1, pageSize: 3 },
    }),
    getCategories(),
    getAuthors(),
  ]);

  const articles: Article[] = articlesData?.data || [];
  const featuredArticles: Article[] = featuredData?.data || [];
  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];
  const total = (articlesData as any)?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  if (featuredArticles.length === 0 && articles.length > 0) {
    featuredArticles.push(articles[0]);
  }

  const leadArticle = featuredArticles[0] || articles[0] || null;
  const leadImageUrl = leadArticle?.cover 
    ? (strapiImageUrlPrefer(leadArticle.cover, ['large', 'medium', 'small', 'thumbnail']) || "") 
    : "";

  const threeCards = articles
    .filter((a) => a.id !== leadArticle?.id)
    .slice(0, 3);

  const getExcerpt = (article: Article & Record<string, any>) =>
    article.description || article.excerpt || article.summary || article.content ||
    "Cliquez pour lire l'intégralité de cet article.";

  const getCategoryLabel = (article: Article) => article.category?.name || "Actualité";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased selection:bg-red-500 selection:text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* EN-TÊTE */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 font-serif">
            {search ? `Résultats : ${search}` : "L'Information Décryptée"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">
            {new Date().toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <AdvancedSearchBar categories={categories} authors={authors} />

        {/* ONGLETS DES CATÉGORIES */}
        {categories.length > 0 && (
          <div className="flex items-center gap-3 my-8 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200/60">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Sections :</span>
            <Link href="/" className={`text-sm font-bold uppercase tracking-wider px-3 py-1 transition ${!categoryFilter ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Tout
            </Link>
            {categories.map((c: any) => (
              <Link
                key={c.id}
                href={`/?category=${c.slug}`}
                className={`text-sm font-bold uppercase tracking-wider px-3 py-1 transition whitespace-nowrap ${categoryFilter === c.slug ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {articles.length > 0 ? (
          <>
            {/* VUE ZONE DE LA UNE (Uniquement sur l'accueil par défaut) */}
            {isDefaultHome && (
              <>
                <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4">À la une</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-12">
                  <div className="lg:col-span-2">
                    <Link href={leadArticle?.slug ? `/articles/${leadArticle.slug}` : '#'} className="group block">
                      <div className="relative overflow-hidden rounded-lg bg-gray-200 mb-4 aspect-[16/9] w-full">
                        {leadImageUrl ? (
                          <Image
                            src={leadImageUrl}
                            alt={leadArticle?.cover?.alternativeText || leadArticle?.title || 'Article'}
                            fill
                            sizes="(max-width: 1024px) 100vw, 800px"
                            className="object-cover group-hover:scale-[1.01] transition duration-300"
                            priority={true}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>
                      {/* Nom de la catégorie bien visible sur la Une */}
                      <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
                        {leadArticle ? getCategoryLabel(leadArticle) : "Actualité"}
                      </span>
                      <h2 className="text-2xl md:text-4xl font-extrabold mt-2 group-hover:text-red-600 transition leading-tight font-serif">
                        {leadArticle?.title}
                      </h2>
                      <p className="text-gray-600 mt-3 text-base md:text-lg line-clamp-3">
                        {leadArticle ? getExcerpt(leadArticle) : ""}
                      </p>
                    </Link>
                  </div>

                  <div className="space-y-6 border-t lg:border-t-0 lg:border-l lg:pl-8 border-gray-200 pt-6 lg:pt-0">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Derniers Décryptages</h3>
                    {threeCards.map((article: Article) => (
                      <article key={article.id} className="block group border-b border-gray-100 pb-4 last:border-0">
                        {/* Nom de la catégorie marqué sur l'article */}
                        <span className="text-xs font-bold text-blue-600 uppercase">{getCategoryLabel(article)}</span>
                        <Link href={article.slug ? `/articles/${article.slug}` : '#'}>
                          <h4 className="font-bold text-lg mt-1 group-hover:text-red-600 transition leading-snug">
                            {article.title}
                          </h4>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SECTION FACT-CHECKING */}
            <section className="factcheck-fullwidth py-4">
              <FactCheckPreview />
            </section>

            {/* GENERATION DYNAMIQUE DES CONTENUS PAR CATEGORIE (Mode Accueil) */}
            {isDefaultHome ? (
              categories.map((cat: any) => {
                // Filtrage de tous les articles appartenant à cette catégorie spécifique (Ex: Innovation, Politique, etc.)
                const categoryArticles = articles.filter(
                  (art) => art.category?.id === cat.id || art.category?.slug === cat.slug
                );

                // Si aucune publication n'est présente dans cette catégorie parmi les données chargées, on ne rend pas la section vide
                if (categoryArticles.length === 0) return null;

                return (
                  <section key={cat.id} className="py-8 border-b border-gray-200 last:border-none">
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-black uppercase tracking-tight font-serif text-slate-900 border-l-4 border-red-600 pl-3">
                        {cat.name}
                      </h3>
                      <Link href={`/?category=${cat.slug}`} className="text-xs font-bold uppercase tracking-wider text-red-600 hover:underline">
                        Voir tout {cat.name} &rarr;
                      </Link>
                    </div>
                    {/* Le HomeGrid reçoit les articles filtrés pour cette catégorie */}
                    <div className="text-left text-gray-900">
                      <HomeGrid threeCards={categoryArticles} />
                    </div>
                  </section>
                );
              })
            ) : (
              /* AFFICHAGE EN CAS DE FILTRE ACTIF (Grille simple standard) */
              <section className="py-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight font-serif">
                    Résultats de filtrage continu
                  </h3>
                </div>
                <div className="text-left text-gray-900">
                  <HomeGrid threeCards={articles} />
                </div>
              </section>
            )}

            {/* PAGINATION */}
            <div className="mt-12 pt-8 border-t border-gray-200">
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
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-200 mt-8 shadow-sm">
            <p className="text-lg text-gray-500 font-medium">Aucun contenu ne correspond à vos critères actuels.</p>
          </div>
        )}
      </main>
    </div>
  );
}