'use client';

import Link from 'next/link';
import { useMemo } from 'react';

interface BreakingNewsBannerProps {
  readonly articles: any[];
}

export default function BreakingNewsBanner({ articles }: BreakingNewsBannerProps) {
  const breakingArticles = useMemo(() => 
    articles.filter((a: any) => a.breaking === true),
    [articles]
  );

  if (breakingArticles.length === 0) return null;

  // Duplicate articles for infinite scroll effect
  const duplicatedArticles = [...breakingArticles, ...breakingArticles];

  return (
    <div className="breaking-ticker-container">
      <div className="breaking-ticker-wrapper">
        <div className="breaking-ticker-content">
          {duplicatedArticles.map((article, idx) => {
            if (!article?.slug) return null;
            return (
              <Link 
                key={`${article.id}-${idx}`}
                href={`/articles/${article.slug}`}
                className="breaking-ticker-item"
              >
                <span className="breaking-ticker-badge">🚨 FLASH</span>
                <span className="breaking-ticker-text">{article.title}</span>
                <span className="breaking-ticker-separator">•</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
