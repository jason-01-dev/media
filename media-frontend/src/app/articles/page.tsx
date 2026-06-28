import { getArticles, getCategories, getAuthors } from "@/lib/strapi";
import { strapiImageUrlPrefer } from "@/lib/image";
import Link from "next/link";
import Image from "next/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";

export const metadata = {
  title: "Actualités & Analyses | Actu 24",
  description: "Votre plateforme d'information en temps réel.",
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

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params?.page ?? "1", 10);
  const pageSize = 15; 
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
  const total = (articlesData as { meta?: { pagination?: { total?: number } } })?.meta?.pagination?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Vérification stricte pour l'affichage de la mise en page Magazine
  const isFirstPage = page === 1 && !search && !categoryFilter;
  
  const mainHeroArticle = isFirstPage ? articles[0] : null;
  const sideHeroArticles = isFirstPage ? articles.slice(1, 4) : [];
  const trendingArticles = isFirstPage ? articles.slice(4, 7) : [];
  const remainingArticles = isFirstPage ? articles.slice(7) : articles;

  // Extraction sécurisée de l'image de l'article Vedette (Main Hero)
  const mainHeroCoverUrl = mainHeroArticle?.cover 
    ? (strapiImageUrlPrefer(mainHeroArticle.cover, ["large", "medium"]) || "") 
    : "";

  return (
    <div className="bg-slate-50 min-h-screen text-slate-950 antialiased selection:bg-red-500 selection:text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* EN-TÊTE DE LA PAGE */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl uppercase font-serif">
            {search ? `Résultats : ${search}` : "L'Information Décryptée"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide uppercase">
            {new Date().toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <AdvancedSearchBar categories={categories} authors={authors} />

        {/* FILTRES DE CATÉGORIES — Pro style */}
        {categories.length > 0 && (
          <div className="flex items-center gap-x-4 overflow-x-auto pb-3 border-b border-slate-100 text-sm my-6 font-medium" aria-label="Catégories">
            <Link href="/articles" className={`whitespace-nowrap transition hover:text-red-700 ${!categoryFilter ? 'text-red-700 font-semibold' : 'text-slate-600'}`}>Tout</Link>
            {categories.map((c: any) => (
              <Link
                key={c.id}
                href={`/articles?category=${c.slug}`}
                className={`whitespace-nowrap transition hover:text-red-700 ${categoryFilter === c.slug ? 'text-red-700 font-semibold' : 'text-slate-600'}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {articles.length > 0 ? (
          <>
            {/* 1. LA SECTION "A LA UNE" ASYMÉTRIQUE */}
            {isFirstPage && mainHeroArticle && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12" aria-label="À la une">
                {/* Grand article vedette */}
                <div className="lg:col-span-2 group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-xl">
                  <Link href={`/articles/${mainHeroArticle.slug}`} className="block relative aspect-[16/9.5] lg:aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    {mainHeroCoverUrl ? (
                      <Image
                        src={mainHeroCoverUrl}
                        alt={mainHeroArticle.cover?.alternativeText || mainHeroArticle.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.025]"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">Pas d’image</div>
                    )}
                    {mainHeroArticle.category && (
                      <span className="absolute top-5 left-5 bg-red-600 text-white text-xs font-bold tracking-[1px] px-3 py-px rounded">{mainHeroArticle.category.name}</span>
                    )}
                  </Link>
                  <div className="p-7">
                    <Link href={`/articles/${mainHeroArticle.slug}`}>
                      <h2 className="font-serif text-[26px] lg:text-3xl leading-tight tracking-[-0.5px] font-semibold text-slate-950 hover:text-red-700 transition">
                        {mainHeroArticle.title}
                      </h2>
                    </Link>
                    <p className="mt-3 text-[15px] text-slate-600 line-clamp-3">{mainHeroArticle.description}</p>
                    
                    <div className="mt-5 text-xs text-slate-500 flex gap-2 font-medium">
                      <span>{mainHeroArticle.author?.name || "Rédaction"}</span>
                      <span className="text-slate-300">•</span>
                      <span>{new Date(mainHeroArticle.publishedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Fil d'actualités vertical de droite */}
                <div className="flex flex-col justify-between space-y-4 border-l border-slate-200 lg:pl-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" /> Également à la une
                  </h3>
                  <div className="divide-y divide-slate-200 flex-1 flex flex-col justify-between">
                    {sideHeroArticles.map((art) => (
                      <article key={art.id} className="py-4 first:pt-0 last:pb-0 group">
                        {art.category && (
                          <span className="text-xs font-bold uppercase tracking-wider text-red-500 block mb-1">
                            {art.category.name}
                          </span>
                        )}
                        <Link href={`/articles/${art.slug}`}>
                          <h4 className="font-serif font-bold text-lg text-slate-900 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                        </Link>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mt-2">
                          Par {art.author?.name || "Rédaction"}
                        </span>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 2. ENCADRÉ MILIEU : FOCUS ET DOSSIERS */}
            {isFirstPage && trendingArticles.length > 0 && (
              <section className="bg-slate-900 text-white p-8 rounded-xl my-12 shadow-inner" aria-label="Grand Angle">
                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                  <h3 className="font-serif text-xl font-bold tracking-tight">Grand Angle & Décryptages</h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Analyses de la rédaction</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trendingArticles.map((art) => {
                    const trendingCoverUrl = art.cover 
                      ? (strapiImageUrlPrefer(art.cover, ["medium", "small"]) || "") 
                      : "";

                    return (
                      <div key={art.id} className="group flex flex-col justify-between h-full">
                        <Link href={`/articles/${art.slug}`} className="block relative aspect-video rounded overflow-hidden mb-3 bg-slate-800">
                          {trendingCoverUrl ? (
                            <Image
                              src={trendingCoverUrl}
                              alt={art.title}
                              fill
                              className="object-cover group-hover:opacity-90 transition"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs">Pas d'image</div>
                          )}
                        </Link>
                        <Link href={`/articles/${art.slug}`}>
                          <h4 className="font-bold text-base text-slate-100 group-hover:text-red-400 transition line-clamp-2 mb-2">
                            {art.title}
                          </h4>
                        </Link>
                        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                          {new Date(art.publishedAt).toLocaleDateString("fr-FR", { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. LE FLUX CONTINU RESTANT */}
            <section aria-label="Flux d'articles récents">
              {isFirstPage && <h3 className="font-serif text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-3 mb-6">Fil d'actualité continu</h3>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {remainingArticles.map((article) => {
                  const coverUrl = article.cover 
                    ? (strapiImageUrlPrefer(article.cover, ["medium", "small"]) || "") 
                    : "";

                  return (
                    <article key={article.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col hover:border-slate-200 transition shadow-sm hover:shadow-md">
                      <Link href={`/articles/${article.slug}`} className="block relative aspect-video bg-slate-100">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 420px"
                            className="object-cover transition group-hover:scale-[1.035]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-400">Pas d’image</div>
                        )}
                      </Link>
                      <div className="p-5 flex flex-col flex-1">
                        {article.category && (
                          <span className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-red-600 mb-1.5">
                            {article.category.name}
                          </span>
                        )}
                        <Link href={`/articles/${article.slug}`}>
                          <h4 className="font-serif font-semibold text-[17px] leading-tight tracking-[-0.15px] text-slate-900 group-hover:text-red-700 transition line-clamp-3">
                            {article.title}
                          </h4>
                        </Link>
                        {article.description && (
                          <p className="mt-auto pt-3 text-sm text-slate-600 line-clamp-2">{article.description}</p>
                        )}
                        <div className="mt-4 pt-4 border-t text-xs text-slate-500 flex items-center justify-between font-medium">
                          <span>{article.author?.name || "Rédaction"}</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* PAGINATION */}
            <div className="mt-12 pt-8 border-t border-slate-200">
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
          <div className="text-center py-24 bg-white rounded-xl border border-slate-200 mt-8 shadow-sm">
            <p className="text-lg text-slate-500 font-medium">Aucun contenu ne correspond à vos critères actuels.</p>
          </div>
        )}
      </main>
    </div>
  );
}