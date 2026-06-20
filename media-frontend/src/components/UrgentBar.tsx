"use client";

import { useEffect, useState } from "react";
import { getFactChecks, getArticles } from "@/lib/strapi";
import Link from "next/link";
import { parseMarkdownToHtml } from "@/lib/markdown";

interface Item {
  id: number;
  type: 'factcheck' | 'article';
  title: string;
  claim?: string;
  verdict?: "verified" | "disputed" | "false";
  breaking?: boolean;
  urgent?: boolean;
  slug?: string;
}

export default function UrgentBar() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFactCheck, setSelectedFactCheck] = useState<Item | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fact-checks
        const fcData = await getFactChecks();
        const factChecks = (fcData as any)?.data?.filter((d: any) => {
          const urgent = d.attributes?.urgent || d.urgent || false;
          const breaking = d.attributes?.breaking || d.breaking || false;
          return urgent || breaking;
        }).map((d: any) => ({
          id: d.id,
          type: 'factcheck' as const,
          title: d.attributes?.claim || d.claim || "",
          claim: d.attributes?.claim || d.claim || "",
          verdict: (d.attributes?.verdict || d.verdict) as Item['verdict'] || 'disputed',
          breaking: d.attributes?.breaking || d.breaking || false,
          urgent: d.attributes?.urgent || d.urgent || false,
          source: d.attributes?.source || d.source || undefined,
          body: d.attributes?.body || d.body || undefined,
          note: d.attributes?.note || d.note || undefined,
        })) || [];

        // Fetch articles
        const artData = await getArticles({ pagination: { page: 1, pageSize: 50 } });
        const articles = (artData as any)?.data?.filter((a: any) => {
          return a.breaking === true || a.urgent === true;
        }).map((a: any) => ({
          id: a.id,
          type: 'article' as const,
          title: a.title || "",
          breaking: a.breaking || false,
          urgent: a.urgent || false,
          slug: a.slug,
        })) || [];

        console.log('Fact-checks urgents:', factChecks);
        console.log('Articles breaking/urgent:', articles);

        // Combine all urgent items
        const allItems = [...factChecks, ...articles];
        
        // Fallback test data if nothing found
        if (allItems.length === 0) {
          allItems.push({
            id: 999,
            type: 'factcheck',
            title: "Test urgence - Vérifiez l'admin pour ajouter des urgences",
            verdict: 'disputed',
            breaking: false,
            urgent: true,
          });
        }
        
        console.log('Tous les items urgents:', allItems);
        setItems(allItems);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll effect - change item every 5 seconds
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div style={{
        backgroundColor: '#fef3c7',
        borderBottom: '2px solid #f59e0b',
        padding: '8px 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            backgroundColor: '#f59e0b',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}>
            ⚠️ URGENT
          </span>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#666',
            fontWeight: '500',
          }}>
            Aucune urgence pour le moment
          </p>
        </div>
      </div>
    );
  }

  const current = items[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Build content display
  const displayText = current.type === 'factcheck' 
    ? current.claim 
    : current.title;

  const link = current.type === 'article' 
    ? `/articles/${current.slug}`
    : '#';

  const content = (
    <div style={{
      backgroundColor: '#fef3c7',
      borderBottom: '2px solid #f59e0b',
      padding: '8px 0',
      cursor: current.type === 'factcheck' ? 'pointer' : 'default',
    }}
    onClick={() => {
      if (current.type === 'factcheck') {
        setSelectedFactCheck(current);
      }
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'space-between',
      }}>
        {/* Badge */}
        <div style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <span style={{
            backgroundColor: current.breaking ? '#c1121f' : '#f59e0b',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold',
          }}>
            {current.breaking ? ' BREAKING' : ' URGENT'}
          </span>
          <span style={{
            fontSize: '10px',
            backgroundColor: '#e5e7eb',
            color: '#666',
            padding: '2px 6px',
            borderRadius: '2px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}>
            {current.type === 'factcheck' ? 'FACT-CHECK' : 'ARTICLE'}
          </span>
        </div>

        {/* Content - scrollable */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#333',
            fontWeight: '500',
          }}>
            {displayText}
          </p>
        </div>

        {/* Verdict badge (only for fact-checks) */}
        {current.type === 'factcheck' && current.verdict && (
          <span style={{
            backgroundColor: current.verdict === 'verified' ? '#10b981' : current.verdict === 'disputed' ? '#f59e0b' : '#ef4444',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 'bold',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            {current.verdict === 'verified' ? '✔️ Vérifié' : current.verdict === 'disputed' ? '⚠️ Contesté' : '❌ Faux'}
          </span>
        )}

        {/* Navigation arrows - only show if multiple */}
        {items.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            flexShrink: 0,
            alignItems: 'center',
          }}>
            <button
              onClick={handlePrev}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                fontSize: '14px',
                color: '#666',
                fontWeight: 'bold',
              }}
              title="Précédent"
            >
              
            </button>
            <span style={{
              fontSize: '11px',
              color: '#999',
              fontWeight: 'bold',
            }}>
              {currentIndex + 1}/{items.length}
            </span>
            <button
              onClick={handleNext}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                fontSize: '14px',
                color: '#666',
                fontWeight: 'bold',
              }}
              title="Suivant"
            >
              
            </button>
          </div>
        )}

        {/* Arrow for articles */}
        {current.type === 'article' && (
          <span style={{
            fontSize: '18px',
            color: '#666',
            flexShrink: 0,
            marginLeft: '8px',
          }}>
            →
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {current.type === 'article' ? <Link href={link}>{content}</Link> : content}

      {/* Modal for fact-check details */}
      {selectedFactCheck && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedFactCheck(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setSelectedFactCheck(null)}
              style={{
                float: 'right',
                border: 'none',
                background: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px'
              }}
            >
              ✕
            </button>

            <h2 style={{ marginBottom: '12px', fontWeight: 'bold' }}>{selectedFactCheck.title}</h2>

            {selectedFactCheck.verdict && (
              <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: selectedFactCheck.verdict === 'verified' ? '#10b981' : selectedFactCheck.verdict === 'disputed' ? '#f59e0b' : '#ef4444' }}>
                {selectedFactCheck.verdict === 'verified' ? '✔️ Vérifié' : selectedFactCheck.verdict === 'disputed' ? '⚠️ Contesté' : '❌ Faux'}
              </div>
            )}

            {selectedFactCheck.type === 'factcheck' && (
              <>
                {selectedFactCheck.source && (
                  <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                    <strong>Source:</strong> {selectedFactCheck.source}
                  </p>
                )}

                {selectedFactCheck.body && (
                  <div className="richtext-content" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(selectedFactCheck.body as string) }} />
                )}

                {selectedFactCheck.note && (
                  <p style={{ fontSize: '13px', color: '#999', marginTop: '12px', fontStyle: 'italic' }}>
                    {selectedFactCheck.note}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
