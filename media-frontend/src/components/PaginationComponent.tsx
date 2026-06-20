'use client';

import Link from 'next/link';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  queryParams?: Record<string, string | string[]>;
  basePath?: string;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  queryParams = {},
  basePath = '/articles'
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    
    // Add all query params
    for (const [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value) {
        params.append(key, String(value));
      }
    }
    
    // Set page
    params.set('page', String(pageNum));
    
    return `${basePath}?${params.toString()}`;
  };

  // Show page numbers range (max 7 pages)
  const getPageNumbers = () => {
    const delta = 3;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(null); // dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="pagination-btn pagination-btn-prev"
          aria-label="Page précédente"
        >
          ← Précédent
        </Link>
      )}

      {/* Page Numbers */}
      <div className="pagination-numbers">
        {getPageNumbers().map((pageNum, idx) => {
          if (pageNum === null) {
            return <span key={`dots-${idx}`} className="pagination-dots">…</span>;
          }
          
          const isActive = pageNum === currentPage;
          return (
            <Link
              key={pageNum}
              href={buildUrl(pageNum)}
              className={`pagination-number ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${pageNum}`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="pagination-btn pagination-btn-next"
          aria-label="Page suivante"
        >
          Suivant →
        </Link>
      )}

      {/* Page Info */}
      <span className="pagination-info">
        Page {currentPage} sur {totalPages}
      </span>
    </nav>
  );
}
