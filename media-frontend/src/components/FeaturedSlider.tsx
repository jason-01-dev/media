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
    <Link href={`/articles/${current.slug}`} className="block">
      <div className="relative h-[420px] rounded-xl overflow-hidden group shadow-sm bg-gray-200 transition-all duration-500">
        
        {/* Affichage sécurisé de l'image */}
        {current.coverUrl && (
          <Image
            src={current.coverUrl}
            alt={current.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            priority
          />
        )}

        {/* Dégradé pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Textes de l'article */}
        <div className="absolute bottom-0 p-6 text-white max-w-3xl z-10">
          <span className="text-xs bg-red-600 px-2 py-1 uppercase font-bold tracking-wider rounded-sm">
            {current.categoryLabel}
          </span>

          <h2 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
            {current.title}
          </h2>

          <p className="mt-2 text-gray-200 line-clamp-2 text-sm md:text-base">
            {current.excerpt}
          </p>
        </div>
        
        {/* Boutons de navigation (petits points en bas à droite) */}
        {featuredArticles.length > 1 && (
          <div 
            className="absolute right-6 bottom-6 flex gap-2 z-20" 
            onClick={(e) => e.preventDefault()} // Évite de déclencher le lien au clic sur un point
          >
            {featuredArticles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white'
                }`}
                aria-label={`Aller à l'article ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}