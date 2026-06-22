'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { strapiImageUrlPrefer } from '@/lib/image';

interface Article {
  id: number;
  title: string;
  slug: string;
  description: string;
  // 🛠️ FIX : On remplace 'Record<string, unknown>' par un typage précis pour Strapi
  cover?: {
    alternativeText?: string | null;
    [key: string]: any; 
  };
  category?: Category;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface HeroCarouselProps {
  readonly featuredArticles: readonly Article[];
}

export default function HeroCarousel({ featuredArticles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredArticles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  const article = featuredArticles[currentIndex];
  if (!article) return null;

  const coverUrl = article.cover
    ? strapiImageUrlPrefer(article.cover, ['large', 'medium', 'small', 'thumbnail'])
    : null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);

  return (
    <section className="hero-wrapper" aria-label={article.title}>
      <div className="hero-image">
        {coverUrl ? (
          <Image
            src={coverUrl}
            // 🛠️ Sécurité supplémentaire : si alternativeText et title n'existent pas, on passe 'Article image'
            alt={article.cover?.alternativeText || article.title || 'Article image'}
            fill
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            className="hero-image-media"
          />
        ) : (
          <div className="hero-placeholder" />
        )}
      </div>

      <div className="hero-content">
        <span className="category-badge">{article.category?.name || 'À LA UNE'}</span>
        <h1>{article.title}</h1>
        {article.description && <p className="lead">{article.description}</p>}
        <Link href={`/articles/${article.slug}`} className="hero-btn">
          Lire l&apos;article →
        </Link>

        {featuredArticles.length > 1 && (
          <div className="hero-carousel-controls">
            <button onClick={prevSlide} className="carousel-btn carousel-prev" aria-label="Article précédent">
              ←
            </button>
            <div className="hero-carousel-indicators">
              {featuredArticles.map((item, idx) => (
                <button
                  key={item.id}
                  className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="carousel-btn carousel-next" aria-label="Article suivant">
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}