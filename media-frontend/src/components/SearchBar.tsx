'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/articles?search=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="search-bar"
      role="search"
      aria-label="Formulaire de recherche d'articles"
    >
      <input
        type="text"
        placeholder="Chercher..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        aria-label="Termes de recherche"
        title="Entrez votre recherche et appuyez sur Entrée"
        suppressHydrationWarning
      />
      <button 
        type="submit" 
        className="search-btn"
        aria-label="Lancer la recherche"
        title="Cliquez pour lancer la recherche"
        suppressHydrationWarning
      >
        <FaSearch className="search-icon" />
      </button>
    </form>
  );
}
