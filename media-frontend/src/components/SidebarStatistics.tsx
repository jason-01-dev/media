'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article, Category } from '@/lib/strapi';
import { strapiImageUrl } from '@/lib/image';
import { useEffect, useState } from 'react';

interface SidebarStatisticsProps {
  recentArticles: Article[];
  categories: Category[];
  articles: Article[];
}

export default function SidebarStatistics({ 
  recentArticles, 
  categories, 
  articles 
}: SidebarStatisticsProps) {
  const [activeUrgentIndex, setActiveUrgentIndex] = useState(0);
  const [activeBreakingIndex, setActiveBreakingIndex] = useState(0);

  // Get featured/urgent articles
  const urgentArticles = articles.filter((a: any) => a.urgent);
  const breakingArticles = articles.filter((a: any) => a.breaking);

  // Auto-scroll urgent articles
  useEffect(() => {
    if (urgentArticles.length <= 1) return;
    const interval = setInterval(() => {
      setActiveUrgentIndex((prev) => (prev + 1) % urgentArticles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [urgentArticles.length]);

  // Auto-scroll breaking articles
  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBreakingIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [breakingArticles.length]);

  return (
    <aside className="sidebar-statistics">
      
      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="sidebar-box">
          <h3 className="sidebar-box-title">📰 Récents</h3>
          <div className="sidebar-articles-list">
            {recentArticles.slice(0, 5).map(article => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="sidebar-list-item">
                {article.cover && (
                  <div className="sidebar-item-thumb">
                    <Image
                      src={strapiImageUrl(article.cover)}
                      alt={article.title}
                      width={60}
                      height={60}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="sidebar-item-text">
                  <h4>{article.title}</h4>
                  <p className="sidebar-item-date">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Urgent Articles - Auto-scroll */}
      {urgentArticles.length > 0 && (
        <section className="sidebar-box sidebar-box-urgent">
          <h3 className="sidebar-box-title">🚨 Urgent</h3>
          <div className="sidebar-articles-list">
            <Link href={`/articles/${urgentArticles[activeUrgentIndex].slug}`} className="sidebar-list-item urgent">
              <div className="sidebar-item-text">
                <h4>{urgentArticles[activeUrgentIndex].title}</h4>
                <span className="urgent-badge">Urgent</span>
                {urgentArticles.length > 1 && (
                  <span style={{fontSize: '0.7rem', opacity: 0.6, marginTop: '4px', display: 'block'}}>
                    {activeUrgentIndex + 1}/{urgentArticles.length}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Breaking News - Auto-scroll */}
      {breakingArticles.length > 0 && (
        <section className="sidebar-box sidebar-box-breaking">
          <h3 className="sidebar-box-title">⚡ Últimas</h3>
          <div className="sidebar-articles-list">
            <Link href={`/articles/${breakingArticles[activeBreakingIndex].slug}`} className="sidebar-list-item breaking">
              <div className="sidebar-item-text">
                <h4>{breakingArticles[activeBreakingIndex].title}</h4>
                <span className="breaking-badge">Última noticia</span>
                {breakingArticles.length > 1 && (
                  <span style={{fontSize: '0.7rem', opacity: 0.6, marginTop: '4px', display: 'block'}}>
                    {activeBreakingIndex + 1}/{breakingArticles.length}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </section>
      )}

    </aside>
  );
}

