import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/strapi';
import { strapiImageUrl } from '@/lib/image';

interface RelatedArticlesProps {
  currentArticle: Article;
  allArticles: Article[];
}

export default function RelatedArticles({ currentArticle, allArticles }: RelatedArticlesProps) {
  // Get articles from same category, excluding current article, latest first
  const relatedArticles = allArticles
    .filter(a => 
      a.id !== currentArticle.id && 
      a.category?.id === currentArticle.category?.id
    )
    .slice(0, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <aside className="related-articles-section">
      <h3 className="section-subtitle">📖 À lire aussi</h3>
      <div className="related-grid">
        {relatedArticles.map(article => (
          <Link key={article.id} href={`/articles/${article.slug}`}>
            <article className="related-card">
              <figure className="related-image">
                {article.cover ? (
                  <Image
                    src={strapiImageUrl(article.cover) || ""}
                    alt={article.cover?.alternativeText || article.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">No image</div>
                )}
              </figure>
              <div className="related-body">
                <h4>{article.title}</h4>
                <p className="related-meta">
                  <span className="author">par {article.author?.name || "Auteur"}</span>
                  <span className="date">
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </aside>
  );
}
