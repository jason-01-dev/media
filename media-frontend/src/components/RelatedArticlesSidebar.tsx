import Link from 'next/link';
import Image from 'next/image';
import { strapiImageUrl } from '@/lib/image';

interface RelatedArticlesProps {
  articles: any[];
  currentArticleId: number;
  limit?: number;
}

export default function RelatedArticlesSidebar({ articles, currentArticleId, limit = 4 }: RelatedArticlesProps) {
  const relatedArticles = articles
    .filter((a: any) => a.id !== currentArticleId)
    .slice(0, limit);

  if (relatedArticles.length === 0) return null;

  return (
    <aside className="related-sidebar">
      <h3 className="sidebar-title">À Lire Aussi</h3>
      <div className="sidebar-articles">
        {relatedArticles.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="sidebar-article-card">
            {article.cover && (
              <div className="sidebar-article-image">
                <Image
                  src={strapiImageUrl(article.cover) || ''}
                  alt={article.cover?.alternativeText || article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="sidebar-article-body">
              <h4>{article.title}</h4>
              <p className="sidebar-article-date">
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
