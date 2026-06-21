"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { strapiImageUrlPrefer } from "@/lib/image";

interface GridItem {
  id: string | number;
  title: string;
  slug: string;
  description?: string;
  publishedAt: string;
  cover?: any;
}

interface HomeGridProps {
  readonly threeCards: readonly GridItem[];
}

export default function HomeGrid({ threeCards }: HomeGridProps) {

  return (
    <div className="news-grid">
      {threeCards.map((article) => {
        const coverUrl = article.cover ? strapiImageUrlPrefer(article.cover, ['medium', 'small', 'thumbnail']) : null;
        return (
          <Link key={article.id} href={article.slug ? `/articles/${article.slug}` : '#'} className="news-card">
            <div className="card-image">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={article.cover?.alternativeText || article.title}
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="card-image-placeholder" />
              )}
            </div>
            <div className="card-body">
              <h3>{article.title}</h3>
              {article.description && <p>{article.description}</p>}
              <div className="text-xs text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
