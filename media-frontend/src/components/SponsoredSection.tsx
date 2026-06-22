import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category, Article } from '@/lib/strapi';
import { strapiImageUrlPrefer } from '@/lib/image';

interface SponsoredSectionProps {
  categories: Category[];
  articles: Article[];
}

const SponsoredSection: React.FC<SponsoredSectionProps> = ({
  categories = [],
  articles = [],
}) => {
  // Get 1 article par catégorie (max 4 articles) - les plus récents
  const featuredArticles: Article[] = [];
  const categoryIds = new Set<number>(); // 👈 Correction : Typé avec 'number' au lieu de 'string'
  
  for (const article of articles) {
    if (featuredArticles.length >= 4) break;
    const catId = article.category?.id;
    if (catId && !categoryIds.has(catId)) {
      featuredArticles.push(article);
      categoryIds.add(catId);
    }
  }

  return (
    <section className="sponsored-section">
      {/* 4 Articles Horizontaux */}
      {featuredArticles.length > 0 && (
        <div className="sponsored-subsection by-category-box">
          <div className="sponsored-header">
            <h3>À LIRE AUSSI</h3>
          </div>
          
          <div className="featured-articles-row">
            {featuredArticles.map((article) => {
              const coverUrl = article.cover
                ? strapiImageUrlPrefer(article.cover, ['medium', 'small', 'thumbnail'])
                : null;
              const href = article.slug ? `/articles/${article.slug}` : '#';
              return (
                <Link 
                  key={article.id}
                  href={href} 
                  className="featured-article-card"
                >
                  <div className="featured-article-image">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={article.cover?.alternativeText || article.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="no-image">Pas d'image</div>
                    )}
                  </div>
                  <div className="featured-article-body">
                    <span className="article-category-tag">{article.category?.name}</span>
                    <h4>{article.title}</h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default SponsoredSection;