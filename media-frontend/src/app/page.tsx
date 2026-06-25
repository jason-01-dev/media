import { Article, getArticles, getCategories, getAuthors } from "@/lib/strapi";
import FactCheckPreview from "@/components/FactCheckPreview";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrlPrefer } from "@/lib/image";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import PaginationComponent from "@/components/PaginationComponent";
import FeaturedSlider from "@/components/FeaturedSlider";
import type { Metadata } from "next";

// 6. CACHE & REVALIDATION (Mise à jour automatique toutes les 60 secondes pour les médias)
export const revalidate = 60;

// 4. RÉFECTION DU SEO (Métadonnées complètes et professionnelles pour le site d'information)
export const metadata: Metadata = {
  title: "Actu 24 | Votre plateforme d'information et de décryptage en continu",
  description: "Retrouvez toute l'actualité en direct, les analyses, les reportages exclusifs et les vérifications des faits (Fact-Checking) sur Actu 24.",
  keywords: ["Actualité", "Information", "RDC", "Décryptage", "Fact-check", "Politique", "Économie", "Sport"],
  authors: [{ name: "Rédaction Actu 24" }],
  openGraph: {
    title: "Actu 24 | Votre plateforme d'information",
    description: "Retrouvez toute l'actualité en direct, les analyses et les décryptages exclusifs sur Actu 24.",
    type: "website",
    url: "/",
    siteName: "Actu 24",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Actu 24 | L'Information Décryptée",
    description: "Retrouvez toute l'actualité en direct et les analyses sur Actu 24.",
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

    // Chargement parallèle et stable des données initiales essentielles
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

    // 7. SÉCURISATION DU CONTENU VIDE (Découpage défensif des articles pour éviter les tableaux vides)
    const featuredArticles = articles.slice(0, Math.min(articles.length, 5)); 
    const topArticles = articles.length > 5 ? articles.slice(5, Math.min(articles.length, 8)) : [];      
    const mainArticles = articles.length > 8 ? articles.slice(8) : [];       

    // Récupération sécurisée et performante des articles par catégorie
    // LE GROS BUG LOGIQUE CORRIGÉ : On fait maintenant des requêtes Strapi ciblées par catégorie en parallèle
    const categoriesWithArticles = await Promise.all(
      categories.map(async (cat: any) => {
        const catArticlesData = await getArticles({
          pagination: { page: 1, pageSize: 4 },
          sort: "publishedAt:desc",
          filters: { category: { id: { $eq: cat.id } } },
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

          {/* HEADER ÉPURÉ */}
          <div className="mb-10 border-b pb-6">
            {categories && categories.length > 0 && (
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-bold uppercase tracking-widest text-red-600" aria-label="Filtres de catégories">
                <div className="flex items-center">
                  <Link href="/" className={`hover:text-slate-900 transition hover:underline ${!categoryFilter ? 'underline text-slate-900 font-black' : ''}`} aria-label="Afficher tous les articles">
                    Tout
                  </Link>
                  <span className="ml-4 text-gray-300 font-normal select-none" aria-hidden="true">•</span>
                </div>

                {categories.map((cat: any, index: number) => (
                  <div key={cat.id || index} className="flex items-center">
                    <Link 
                      href={`/?category=${cat.slug}`} 
                      className={`hover:text-slate-900 transition hover:underline ${categoryFilter === cat.slug ? 'underline text-slate-900 font-black' : ''}`}
                      aria-label={`Filtrer par catégorie ${cat.name}`}
                    >
                      {cat.name}
                    </Link>
                    {index < categories.length - 1 && (
                      <span className="ml-4 text-gray-300 font-normal select-none" aria-hidden="true">•</span>
                    )}
                  </div>
                ))}
              </nav>
            )}

            <h1 className="text-4xl md:text-5xl font-black font-serif">
              L'Information Décryptée
            </h1>
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

          {/* TOP ARTICLES */}
          {topArticles.length > 0 && (
            <section className="grid md:grid-cols-3 gap-6 mb-12" aria-label="Articles mis en avant">
              {topArticles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} aria-label={`Lire l'article : ${article.title}`}>
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
          )}

          {/* SECTION FACT-CHECK STYLE FIL D'ACTUALITÉ / STREAMING */}
<section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-slate-900 text-white py-12 mb-14 border-y border-slate-800" aria-label="Zone de vérification des faits en direct">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-400">
            Fact-Checking en direct
          </span>
        </div>
        <h2 className="text-2xl font-black font-serif mt-1 text-white">
          Le Vrai du Faux
        </h2>
      </div>
      
      <Link 
        href="/fact-checks" 
        className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all duration-200 no-underline"
      >
        Voir tout le flux →
      </Link>
    </div>

    {/* Conteneur fluide et sécurisé pour le streaming de fact-checks */}
    <div className="fact-check-streaming-container grid gap-4">
      <FactCheckPreview />
    </div>
  </div>
</section>

          {/* MAIN FEED (FLUX CONTINU) */}
          {mainArticles.length > 0 && (
            <section className="mb-16" aria-label="Flux d'actualités continu">
              <h2 className="text-2xl font-bold mb-8 font-serif border-b pb-2">
                Flux d’actualité
              </h2>

              <div className="space-y-8">
                {mainArticles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`} aria-label={`Lire l'article : ${article.title}`}>
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
          )}

          {/* BLOCS PAR CATÉGORIES (VRAI SYSTÈME AUTONOME SÉCURISÉ) */}
          <section className="space-y-16" aria-label="Articles par catégories thématiques">
            {categoriesWithArticles.map((cat: any) => {
              if (!cat.articles || cat.articles.length === 0) return null;

              return (
                <div key={cat.id} className="border-t pt-8 first:border-0 first:pt-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold font-serif uppercase tracking-tight text-slate-800 border-l-4 border-red-600 pl-3">
                      {cat.name}
                    </h3>
                    <Link href={`/?category=${cat.slug}`} className="text-sm font-semibold text-red-600 hover:underline" aria-label={`Voir plus d'articles de la catégorie ${cat.name}`}>
                      Voir plus →
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {cat.articles.map((article: Article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} aria-label={`Lire l'article : ${article.title}`}>
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