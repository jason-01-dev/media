import Link from 'next/link';
import Image from 'next/image';
import { strapiImageUrlPrefer } from '@/lib/image';

interface RelatedArticlesProps {
  readonly articles: any[];
  readonly currentArticleId: number;
  readonly limit?: number;
}

export default function RelatedArticlesSidebar(props: Readonly<RelatedArticlesProps>) {
  const { articles, currentArticleId, limit = 4 } = props;
  const relatedArticles = articles
    .filter((a: any) => a.id !== currentArticleId)
    .slice(0, limit);

  if (relatedArticles.length === 0) return null;

  return (
    <aside className="related-sidebar">
      <h3 className="sidebar-title">À Lire Aussi</h3>
      <div className="sidebar-articles">
        {relatedArticles.map((article) => {
          const coverUrl = article.cover
            ? strapiImageUrlPrefer(article.cover, ['medium', 'small', 'thumbnail'])
            : null;
          const href = article.slug ? `/articles/${article.slug}` : '#';
          return (
            <Link key={article.id} href={href} className="sidebar-article-card">
              {coverUrl && (
                <div className="sidebar-article-image">
                  <Image
                    src={coverUrl}
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
          );
        })}
      </div>
    </aside>
  );
}
