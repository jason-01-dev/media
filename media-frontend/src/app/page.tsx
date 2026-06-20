import { getArticles } from "@/lib/strapi";
import HomeGrid from "@/components/HomeGrid";
import FactCheckPreview from "@/components/FactCheckPreview";
import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrl } from "@/lib/image";

export default async function Home() {
  const articlesData = await getArticles({ pagination: { page: 1, pageSize: 20 } });

  const articles = articlesData?.data || [];
  const featuredArticles = articles.filter((a: any) => a.featured === true).slice(0, 3);
  if (featuredArticles.length === 0 && articles.length > 0) {
    featuredArticles.push(articles[0]);
  }

  const featuredIds = new Set(featuredArticles.map((a: any) => a.id));
  const threeCards = articles.filter((a: any) => !featuredIds.has(a.id)).slice(0, 3);
  const trendingArticles = articles.filter((a: any) => !featuredIds.has(a.id)).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {featuredArticles.length > 0 && (
        <HeroCarousel featuredArticles={featuredArticles} />
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="layout2">
          <div className="layout-title hidden">Layout 2</div>
          <HomeGrid threeCards={threeCards} />
        </div>
      </main>

      <section className="cta-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2>Consultez tous nos articles</h2>
          <p>Retrouvez l'intégralité de nos actualités et analyses approfondies.</p>
          <Link href="/articles" className="btn-primary">
            Voir tous les articles →
          </Link>
        </div>
      </section>

      <FactCheckPreview />

      {trendingArticles.length > 0 && (
        <section className="trending-section">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="section-title">les plus lus</h2>
            <div className="trending-grid">
              {trendingArticles.map((article, idx) => {
                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className={`trending-card ${idx === 0 ? 'featured' : ''}`}
                  >
                    <div className="trending-index">{idx + 1}</div>
                    <div className="trending-content">
                      {article.category && <span className="trending-category">{article.category.name}</span>}
                      <h3>{article.title}</h3>
                      <p className="trending-date">
                        {article.views !== undefined && article.views !== null
                          ? ` ${article.views.toLocaleString('fr-FR')} vues`
                          : `Publié le ${new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    {article.cover && (
                      <div className="trending-image">
                        <Image
                          src={strapiImageUrl(article.cover, 'small') || ''}
                          alt={article.cover?.alternativeText || article.title}
                          width={200}
                          height={120}
                          sizes="(max-width:768px) 40vw, 200px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
