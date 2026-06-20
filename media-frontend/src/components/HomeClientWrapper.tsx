"use client";

import dynamic from "next/dynamic";
import React from "react";

const HeroCarousel = dynamic(() => import("@/components/HeroCarousel"), { ssr: false });

interface Article {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover?: any;
  featured?: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  featuredArticles: any[];
  allArticles: any[];
  categories: any[];
}

export default function HomeClientWrapper({ featuredArticles, allArticles, categories }: Props) {
  return (
    <>
      {featuredArticles.length > 0 && (
        <HeroCarousel featuredArticles={featuredArticles} allArticles={allArticles} categories={categories} />
      )}
    </>
  );
}
