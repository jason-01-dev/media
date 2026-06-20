"use client";

import Link from "next/link";
import { FaBroadcastTower } from "react-icons/fa";
import SearchBar from "@/components/SearchBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import UrgentBar from "@/components/UrgentBar";
import MobileNav from "@/components/MobileNav";
import React from "react";

interface HeaderProps {
  categories?: any[];
}

export default function Header({ categories = [] }: HeaderProps) {
  return (
    <header className="site-header" role="banner" aria-label="En-tête du site">
      <div className="container header-inner">
        <Link 
          href="/" 
          className="site-logo"
          aria-label="Actu24 - Page d'accueil"
        >
          <span className="logo-mark" aria-hidden="true">
            <FaBroadcastTower className="logo-broadcast-icon" />
          </span>
          <span className="logo-text">Actu<span className="logo-number">24</span></span>
        </Link>
        
        <nav className="top-links" aria-label="Navigation principale">
          <Link href="/" title="Aller à la page d'accueil">Accueil</Link>
          <Link href="/articles" title="Voir tous les articles">Articles</Link>
          <Link href="/about" title="En savoir plus sur nous">À propos</Link>
        </nav>

        <SearchBar />
        
        <MobileNav />
      </div>

      <UrgentBar />
    </header>
  );
}
