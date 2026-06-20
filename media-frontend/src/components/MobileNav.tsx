"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { getCategories } from "@/lib/strapi";

interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const loadCategories = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await getCategories();
      if (data?.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen, categories.length, loadCategories]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  let categoryList: React.ReactNode;
  if (loading) {
    categoryList = <div className="mobile-nav-loading">Chargement...</div>;
  } else if (categories.length > 0) {
    categoryList = (
      <ul className="mobile-nav-articles">
        {categories.map((category) => (
          <li key={category.documentId}>
            <Link 
              href={`/articles?category=${category.slug}`}
              className="mobile-nav-article-link"
              onClick={closeMenu}
              title={category.name}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    );
  } else {
    categoryList = <div className="mobile-nav-empty">Aucune catégorie</div>;
  }

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={toggleMenu}
        aria-label="Ouvrir le menu de navigation"
        aria-expanded={isOpen}
        title="Menu de navigation"
      >
        {isOpen ? (
          <FaTimes className="menu-icon" />
        ) : (
          <FaBars className="menu-icon" />
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="mobile-nav-overlay"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <nav className="mobile-nav" role="navigation" aria-label="Menu mobile">
            {/* Navigation principale */}
            <div className="mobile-nav-section">
              <Link 
                href="/" 
                className="mobile-nav-link"
                onClick={closeMenu}
                title="Aller à la page d'accueil"
              >
                Accueil
              </Link>
              <Link 
                href="/articles" 
                className="mobile-nav-link"
                onClick={closeMenu}
                title="Voir tous les articles"
              >
                Articles
              </Link>
              <Link 
                href="/fact-check" 
                className="mobile-nav-link"
                onClick={closeMenu}
                title="Consulter les fact-checks"
              >
                Fact-Check
              </Link>
              <Link 
                href="/about" 
                className="mobile-nav-link"
                onClick={closeMenu}
                title="En savoir plus sur nous"
              >
                À propos
              </Link>
            </div>

            {/* Séparateur */}
            <div className="mobile-nav-divider" />

            {/* Catégories des actualités */}
            <div className="mobile-nav-section">
              <h3 className="mobile-nav-title">Catégories</h3>
              {categoryList}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
