'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/strapi';

interface AdvancedSearchProps {
  categories: Category[];
  authors: Array<{ id: number; name: string }>;
}

export default function AdvancedSearchBar({ categories, authors }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [breaking, setBreaking] = useState(false);

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    
    if (selectedAuthors.length > 0) {
      params.append('authors', selectedAuthors.join(','));
    }
    if (selectedCategories.length > 0) {
      params.append('categories', selectedCategories.join(','));
    }
    if (dateFrom) {
      params.append('dateFrom', dateFrom);
    }
    if (dateTo) {
      params.append('dateTo', dateTo);
    }
    if (urgent) {
      params.append('urgent', 'true');
    }
    if (breaking) {
      params.append('breaking', 'true');
    }
    
    return `/articles?${params.toString()}`;
  };

  const toggleAuthor = (id: number) => {
    setSelectedAuthors(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const resetFilters = () => {
    setSelectedAuthors([]);
    setSelectedCategories([]);
    setDateFrom('');
    setDateTo('');
    setUrgent(false);
    setBreaking(false);
  };

  const hasActiveFilters = selectedAuthors.length > 0 || selectedCategories.length > 0 || 
                           dateFrom || dateTo || urgent || breaking;

  return (
    <div className="advanced-search-wrapper mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="advanced-search-toggle"
      >
        {isOpen ? '▼' : '▶'} Recherche avancée
        {hasActiveFilters && <span className="filter-badge">{[selectedAuthors.length, selectedCategories.length, (dateFrom ? 1 : 0), (dateTo ? 1 : 0), urgent ? 1 : 0, breaking ? 1 : 0].reduce((a, b) => a + b)} filtres</span>}
      </button>

      {isOpen && (
        <div className="advanced-search-panel">
          
          {/* Catégories */}
          <fieldset className="search-fieldset">
            <legend>📁 Catégories</legend>
            <div className="checkbox-group">
              {categories.map(cat => (
                <label key={cat.id} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Auteurs */}
          <fieldset className="search-fieldset">
            <legend>✍️ Auteurs</legend>
            <div className="checkbox-group">
              {authors.map(author => (
                <label key={author.id} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedAuthors.includes(author.id)}
                    onChange={() => toggleAuthor(author.id)}
                  />
                  {author.name}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Dates */}
          <fieldset className="search-fieldset">
            <legend>📅 Période</legend>
            <div className="date-inputs">
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="De"
                className="date-input"
              />
              <span className="date-separator">→</span>
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="À"
                className="date-input"
              />
            </div>
          </fieldset>

          {/* Drapeaux */}
          <fieldset className="search-fieldset">
            <legend>⚡ Contenus spéciaux</legend>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                🚨 Articles urgents
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={breaking}
                  onChange={(e) => setBreaking(e.target.checked)}
                />
                ⚡ Últimas noticias
              </label>
            </div>
          </fieldset>

          {/* Boutons */}
          <div className="search-actions">
            <Link href={buildSearchUrl()} className="search-btn search-btn-primary">
              🔍 Rechercher
            </Link>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="search-btn search-btn-secondary"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
