'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SliderProps {
  featuredArticles: any[];
  getImage: (article: any) => string;
  getCategoryLabel: (article: any) => string;
  getExcerpt: (article: any) => string;
}

export default function FeaturedSlider({ featuredArticles, getImage, getCategoryLabel, getExcerpt }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Défilement automatique toutes les 5 secondes (Optionnel mais très pro)
  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredArticles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  if (!featuredArticles || featuredArticles.length === 0) return null;

  const currentArticle = featuredArticles[currentIndex];

  return (
    <div className="relative h-[460px] w-full rounded-xl overflow-hidden group shadow-md bg-slate-900 border border-gray-100">
      
      {/* Article Actuel */}
      <Link href={`/articles/${currentArticle.slug}`} className="block h-full w-full relative">
        {getImage(currentArticle) && (
          <Image
            src={getImage(currentArticle)}
            alt={currentArticle.title}
            fill
            className="object-cover transition duration-700 ease-out scale-100 group-hover:scale-[1.02]"
            priority
          />
        )}

        {/* Dégradé sombre pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Contenu de l'article */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white max-w-3xl z-10">
          <span className="text-xs bg-red-600 px-2.5 py-1 uppercase font-black tracking-widest rounded-sm">
            {getCategoryLabel(currentArticle)}
          </span>

          <h2 className="text-2xl md:text-4xl font-extrabold mt-3 leading-tight font-serif drop-shadow-sm group-hover:text-red-200 transition">
            {currentArticle.title}
          </h2>

          <p className="mt-2 text-gray-200 line-clamp-2 text-xs md:text-sm font-medium text-slate-200/90">
            {getExcerpt(currentArticle)}
          </p>
        </div>
      </Link>

      {/* Flèches de navigation de gauche/droite (visibles au survol) */}
      {featuredArticles.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredArticles.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-red-600 text-white p-2.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300 shadow-md"
            aria-label="Précédent"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredArticles.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-red-600 text-white p-2.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300 shadow-md"
            aria-label="Suivant"
          >
            →
          </button>

          {/* Indicateurs de position (Petits points en bas à droite) */}
          <div className="absolute bottom-6 right-6 z-20 flex gap-2">
            {featuredArticles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-red-600' : 'w-2 bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}