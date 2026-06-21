import { getArticles } from "@/lib/strapi";
import HomeGrid from "@/components/HomeGrid";
import FactCheckPreview from "@/components/FactCheckPreview";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrlPrefer } from "@/lib/image";

export default async function Home() {
  const articlesData = await getArticles({ pagination: { page: 1, pageSize: 20 } });

  const articles = articlesData?.data || [];
  const featuredArticles = articles.filter((a: any) => a.featured === true).slice(0, 3);
  if (featuredArticles.length === 0 && articles.length > 0) {
    featuredArticles.push(articles[0]);
  }

  const featuredIds = new Set(featuredArticles.map((a: any) => a.id));
  const threeCards = articles.filter((a: any) => !featuredIds.has(a.id)).slice(0, 3);
  const leadArticle = featuredArticles[0] || articles[0] || null;
  const leadImageUrl = leadArticle?.cover ? strapiImageUrlPrefer(leadArticle.cover, ['large', 'medium', 'small']) : null;

  const getExcerpt = (article: any) =>
    article.description || article.excerpt || article.summary || article.content ||
    "Voici le résumé ou le premier paragraphe de votre article phare. Il donne envie de cliquer pour en savoir plus sur cette investigation ou cette analyse majeure.";

  const getCategoryLabel = (article: any) => article.category?.name || "Actualité";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4">À la une</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-12">
          <div className="lg:col-span-2">
            <Link
              href={leadArticle?.slug ? `/articles/${leadArticle.slug}` : '#'}
              className="group block"
            >
              {/* 🛠️ MODIFICATION ICI : Ajout de la classe 'relative' */}
              <div className="relative overflow-hidden rounded-lg bg-gray-200 mb-4 aspect-[16/9] w-full">
                {leadImageUrl ? (
                  <Image
                    src={leadImageUrl}
                    alt={leadArticle?.cover?.alternativeText || leadArticle?.title || 'Article'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                    priority={true} // ⚡ Charge l'image à la une immédiatement sans lazy-loading
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>

              <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">
                {getCategoryLabel(leadArticle)}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold mt-2 group-hover:text-red-600 transition leading-tight">
                {leadArticle?.title || 'Le grand titre de l\'article principal qui capte immédiatement l\'attention du lecteur'}
              </h1>
              <p className="text-gray-600 mt-3 text-base md:text-lg line-clamp-3">
                {leadArticle ? getExcerpt(leadArticle) :
                  "Voici le résumé ou le premier paragraphe de votre article phare. Il donne envie de cliquer pour en savoir plus sur cette investigation ou cette analyse majeure."
                }
              </p>
            </Link>
          </div>

          <div className="space-y-6 border-t lg:border-t-0 lg:border-l lg:pl-8 border-gray-200 pt-6 lg:pt-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Derniers Décryptages</h3>
            {threeCards.map((article: any) => {
              const href = article.slug ? `/articles/${article.slug}` : '#';
              return (
                <Link key={article.id} href={href} className="block group border-b border-gray-100 pb-4 last:border-0">
                  <span className="text-xs font-bold text-blue-600 uppercase">{getCategoryLabel(article)}</span>
                  <h4 className="font-bold text-lg mt-1 group-hover:text-red-600 transition">
                    {article.title}
                  </h4>
                </Link>
              );
            })}
            {threeCards.length === 0 && (
              <div className="text-sm text-gray-600">Aucun article supplémentaire disponible pour le moment.</div>
            )}
          </div>
        </div>
      </main>

      <section className="factcheck-fullwidth py-12">
        <FactCheckPreview />
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight">Les Grands Titres du jour</h2>
        </div>
        <div className="text-left text-gray-900">
          <HomeGrid threeCards={threeCards} />
        </div>
      </section>

      <section className="bg-white border-t border-gray-200 py-16 text-center">
        <h3 className="text-xl font-bold mb-2">Vous voulez en voir plus ?</h3>
        <p className="text-gray-600 mb-6">Accédez à l&apos;intégralité de nos publications et analyses approfondies.</p>
        <Link href="/articles" className="inline-block bg-red-600 text-white px-6 py-3 font-semibold rounded hover:bg-red-700 transition">
          Voir tous les articles →
        </Link>
      </section>
    </div>
  );
}