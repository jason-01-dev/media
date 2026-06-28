'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// On définit proprement la structure d'un article simplifié transmis par le serveur
type SimpleArticle = {
  id: string | number;
  slug: string;
  title: string;
  coverUrl: string;
  categoryLabel: string;
  excerpt: string;
};

// Désormais, le Slider n'attend qu'une seule et unique prop : le tableau d'articles
interface FeaturedSliderProps {
  featuredArticles: SimpleArticle[];
}

export default function FeaturedSlider({ featuredArticles }: FeaturedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Défilement automatique toutes les 5 secondes
  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  if (!featuredArticles || featuredArticles.length === 0) return null;

  const current = featuredArticles[currentIndex];

  return (
    <Link href={`/articles/${current.slug}`} className="block group">
      <div className="relative h-[460px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl bg-slate-900 transition-all duration-500">
        
        {current.coverUrl && (
          <Image
            src={current.coverUrl}
            alt={current.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        )}

        {/* Elegant gradient + subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(#fff_0.6px,transparent_1px)] bg-[length:4px_4px] opacity-[0.035]" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
          <div className="max-w-3xl">
            <span className="inline-block rounded bg-red-600 px-3 py-px text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              {current.categoryLabel}
            </span>

            <h2 className="font-serif text-3xl md:text-[42px] leading-[1.05] font-semibold tracking-tighter">
              {current.title}
            </h2>

            {current.excerpt && (
              <p className="mt-4 max-w-2xl text-lg text-white/80 line-clamp-2">
                {current.excerpt}
              </p>
            )}
          </div>
        </div>
        
        {/* Refined dots */}
        {featuredArticles.length > 1 && (
          <div 
            className="absolute right-8 bottom-8 flex gap-2 z-20" 
            onClick={(e) => e.preventDefault()}
          >
            {featuredArticles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 ${idx === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Aller à l'article ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}