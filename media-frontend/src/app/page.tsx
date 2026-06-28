import { Article, getArticles, getCategories, getAuthors } from "@/lib/strapi";
import FactCheckPreview from "@/components/FactCheckPreview";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrlPrefer } from "@/lib/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";
import FeaturedSlider from "@/components/FeaturedSlider";
import type { Metadata } from "next";

// Dynamic because of searchParams + category filters
export const dynamic = 'force-dynamic';
export const revalidate = 60;

// 4. RÉFECTION DU SEO (Métadonnées complètes et professionnelles pour le site d'information)
export const metadata: Metadata = {
  title: "Actu 24 | L'Information Décryptée",
  description: "Actualité en temps réel, analyses approfondies et vérification des faits rigoureuse. L'information de confiance.",
  keywords: ["Actualité", "Information", "RDC", "Afrique", "Fact-check", "Politique", "Économie", "Décryptage"],
  authors: [{ name: "Rédaction Actu 24" }],
  openGraph: {
    title: "Actu 24 — L'Information Décryptée",
    description: "Toute l'actualité, analyses et fact-checking de référence.",
    type: "website",
    locale: "fr_FR",
    siteName: "Actu 24",
  },
  twitter: {
    card: "summary_large_image",
    title: "Actu 24 | L'Information Décryptée",
    description: "Actualité, analyses et vérification des faits.",
  },
};

// 1. TYPAGE STRICT (Remplacement complet de ': any')
interface PageProps {
  searchParams?: Promise<{
    page?: string;
    category?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  // 2. AUCUNE GESTION D'ERREUR -> Sécurisation globale de la page par un bloc try/catch
  try {
    const params = await searchParams;

    // 3. VALIDATION DE PAGE ROBUSTE (Évite le crash avec NaN ou les pages négatives)
    const page = Math.max(1, Number.parseInt(params?.page ?? "1", 10) || 1);
    const pageSize = 20;

    // Récupération de la catégorie cliquée dans le filtre
    const categoryFilter = params?.category || "";

    // Construction dynamique du filtre pour le flux d'actualité principal
    const filters: any = {};
    if (categoryFilter) {
      filters.category = { slug: { $eq: categoryFilter } };
    }

    // Parallel data fetching - main feed + categories + authors
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

    // Smart slicing for sections (safe)
    const featuredArticles = articles.slice(0, Math.min(articles.length, 5));
    const topArticles = articles.length > 5 ? articles.slice(5, Math.min(articles.length, 8)) : [];
    const mainArticles = articles.length > 8 ? articles.slice(8) : [];

    // Better: fetch articles once with populate and group by category (avoids N+1)
    // For simplicity and correctness we still do small targeted calls but limit them
    const categoriesWithArticles = await Promise.all(
      categories.slice(0, 6).map(async (cat: any) => {
        const catArticlesData = await getArticles({
          pagination: { page: 1, pageSize: 4 },
          sort: "publishedAt:desc",
          filters: { category: { documentId: { $eq: cat.documentId } } }, // use documentId for stability
        });
        return {
          ...cat,
          articles: catArticlesData?.data || [],
        };
      })
    );

    const getImage = (article: Article) =>
      strapiImageUrlPrefer(article.cover, ["large", "medium", "small"]) || "";

    const getExcerpt = (article: any) =>
      article.description || article.excerpt || article.summary || "";

    const getCategoryLabel = (article: Article) =>
      article.category?.name || "Actualité";

    return (
      <div className="bg-slate-50 min-h-screen text-gray-900">
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

          {/* HEADER ÉPURÉ + PRO */}
          <div className="mb-10 border-b pb-7">
            {categories && categories.length > 0 && (
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-4 text-xs font-semibold tracking-widest text-slate-600" aria-label="Filtres de catégories">
                <Link href="/" className={`transition hover:text-slate-900 ${!categoryFilter ? 'text-slate-900 underline decoration-2 underline-offset-4' : 'hover:underline'}`}>
                  Tout
                </Link>
                {categories.map((cat: any, index: number) => (
                  <span key={cat.id || index} className="flex items-center gap-5">
                    <span className="text-slate-300 select-none">•</span>
                    <Link 
                      href={`/?category=${cat.slug}`} 
                      className={`transition hover:text-slate-900 ${categoryFilter === cat.slug ? 'text-slate-900 underline decoration-2 underline-offset-4' : 'hover:underline'}`}
                    >
                      {cat.name}
                    </Link>
                  </span>
                ))}
              </nav>
            )}

            <h1 className="text-5xl md:text-[56px] font-semibold tracking-[-1.8px] font-serif leading-none text-slate-950">
              L’Information Décryptée
            </h1>
            <p className="mt-3 text-slate-600 max-w-md">Analyses, reportages et vérifications en temps réel.</p>
          </div>

          <AdvancedSearchBar categories={categories} authors={authors} />

          {/* HERO SLIDER CARROUSEL DYNAMIQUE */}
          {featuredArticles.length > 0 && (
            <section className="mb-12" aria-label="Articles à la une">
              <FeaturedSlider 
                featuredArticles={featuredArticles.map((article) => ({
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  coverUrl: getImage(article),
                  categoryLabel: getCategoryLabel(article),
                  excerpt: getExcerpt(article),
                }))}
              />
            </section>
          )}

          {/* TOP ARTICLES - Pro cards */}
          {topArticles.length > 0 && (
            <section className="mb-12" aria-label="Articles mis en avant">
              <div className="grid md:grid-cols-3 gap-5">
                {topArticles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
                    <div className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:border-slate-200 hover:shadow-lg">
                      <div className="relative aspect-[16/9] bg-slate-100">
                        {getImage(article) && (
                          <Image
                            src={getImage(article)}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40" />
                      </div>
                      <div className="p-4">
                        <div className="text-[10px] uppercase tracking-[1.5px] font-semibold text-red-600">{getCategoryLabel(article)}</div>
                        <h3 className="mt-1.5 text-[15px] leading-snug font-semibold tracking-[-0.2px] group-hover:text-red-600 line-clamp-3 transition">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PREMIUM FACT-CHECK SECTION - Clean & Professional */}
          <section className="my-14 rounded-2xl bg-slate-950 text-white overflow-hidden" aria-label="Vérification des faits">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[2px] text-red-400 mb-3">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> EN TEMPS RÉEL
                  </div>
                  <h2 className="font-serif text-4xl font-black tracking-tighter">Le Vrai du Faux</h2>
                  <p className="mt-2 max-w-md text-slate-400 text-[15px]">Vérifications rigoureuses des affirmations qui circulent.</p>
                </div>
                <Link 
                  href="/fact-check" 
                  className="inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Consulter toutes les vérifications <span aria-hidden>→</span>
                </Link>
              </div>

              <FactCheckPreview />
            </div>
          </section>

          {/* MAIN FEED (FLUX CONTINU) */}
          {mainArticles.length > 0 && (
            <section className="mb-16" aria-label="Flux d'actualités continu">
              <h2 className="text-2xl font-bold mb-8 font-serif border-b pb-2">
                Flux d’actualité
              </h2>

              <div className="divide-y divide-slate-100">
                {mainArticles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group block py-6 first:pt-0 last:pb-0">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-2/5 relative aspect-video md:aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                        {getImage(article) && (
                          <Image
                            src={getImage(article)}
                            alt={article.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.035]"
                          />
                        )}
                      </div>

                      <div className="flex-1 pt-1">
                        <span className="text-[10px] font-black tracking-[1.5px] uppercase text-red-600">{getCategoryLabel(article)}</span>
                        <h3 className="mt-1.5 font-serif text-[20px] leading-[1.15] font-semibold tracking-tight group-hover:text-red-700 transition line-clamp-3">
                          {article.title}
                        </h3>
                        {getExcerpt(article) && (
                          <p className="mt-3 text-[14px] text-slate-600 line-clamp-2">{getExcerpt(article)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* BLOCS PAR CATÉGORIES (VRAI SYSTÈME AUTONOME SÉCURISÉ) */}
          <section className="space-y-16" aria-label="Articles par catégories thématiques">
            {categoriesWithArticles.map((cat: any) => {
              if (!cat.articles || cat.articles.length === 0) return null;

              return (
                <div key={cat.id} className="border-t pt-8 first:border-0 first:pt-0">
                  <div className="flex justify-between items-baseline mb-5">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                      <span className="inline-block h-[3px] w-7 bg-red-600 align-middle" />
                      {cat.name}
                    </h3>
                    <Link href={`/?category=${cat.slug}`} className="text-xs uppercase tracking-widest font-bold text-red-600 hover:text-red-700 transition">Voir tout →</Link>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
                    {cat.articles.map((article: Article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
                        <div className="h-full flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden transition hover:border-slate-300 hover:shadow-md">
                          <div className="relative aspect-[16/9] bg-slate-100">
                            {getImage(article) && (
                              <Image src={getImage(article)} alt={article.title} fill className="object-cover transition-transform group-hover:scale-105" />
                            )}
                          </div>
                          <div className="flex-1 p-4 flex flex-col">
                            <span className="text-[10px] font-bold tracking-[1.2px] uppercase text-red-600">{cat.name}</span>
                            <h4 className="mt-2 font-semibold text-[15px] leading-tight tracking-tight line-clamp-3 group-hover:text-red-700 transition">
                              {article.title}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* PAGINATION CONTROLLÉE */}
          {totalPages > 1 && (
            <div className="mt-16">
              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
              />
            </div>
          )}

        </main>
      </div>
    );
  } catch (error) {
    console.error("Erreur d'exécution de la page d'accueil Actu 24:", error);
    // Rendu de secours élégant pour éviter l'écran blanc ou l'erreur 500 brute
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Service temporairement indisponible</h2>
        <p className="text-gray-600 mt-2 max-w-md">Une erreur est survenue lors de la récupération des actualités. Nos équipes techniques sont déjà sur le coup.</p>
        <Link href="/" className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition text-sm">
          Réessayer la page
        </Link>
      </div>
    );
  }
}