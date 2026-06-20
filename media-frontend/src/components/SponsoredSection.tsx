import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category, Article } from '@/lib/strapi';
import { strapiImageUrl } from '@/lib/image';

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
  const categoryIds = new Set<string>();
  
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
            {featuredArticles.map((article) => (
              <Link 
                key={article.id}
                href={`/articles/${article.slug}`} 
                className="featured-article-card"
              >
                <div className="featured-article-image">
                  {article.cover ? (
                    <Image
                      src={strapiImageUrl(article.cover)}
                      alt={article.title}
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
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SponsoredSection;
