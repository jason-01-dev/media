"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFactChecks } from "@/lib/strapi";
import { parseMarkdownToHtml } from "@/lib/markdown";

interface Claim {
  id: number;
  claim: string;
  verdict: "verified" | "disputed" | "false";
  source?: string;
  body?: string;
  mediaUrl?: string;
  mediaName?: string;
  note?: string;
  featured?: boolean;
  breaking?: boolean;
  urgent?: boolean;
}

function getFactCheckVerdictLabel(verdict: Claim['verdict']) {
  if (verdict === 'verified') return 'Vérifié';
  if (verdict === 'disputed') return 'Contesté';
  return 'Faux';
}

function buildMediaUrl(mediaData: any, baseUrl: string) {
  if (!mediaData) return undefined;

  const firstMedia = Array.isArray(mediaData) ? mediaData[0] : mediaData;
  const mediaPath = firstMedia?.attributes?.url;
  if (!mediaPath) return undefined;

  return mediaPath.startsWith('http') ? mediaPath : `${baseUrl}${mediaPath}`;
}

function mapFactCheckItem(d: any, baseUrl: string): Claim {
  const mediaData = d.attributes?.media?.data;
  return {
    id: d.id,
    claim: d.attributes?.claim || d.claim || "",
    verdict: (d.attributes?.verdict || d.verdict) as Claim['verdict'] || 'disputed',
    source: d.attributes?.source || d.source || undefined,
    body: d.attributes?.body || d.body || undefined,
    mediaUrl: buildMediaUrl(mediaData, baseUrl),
    mediaName: Array.isArray(mediaData)
      ? mediaData[0]?.attributes?.name
      : mediaData?.attributes?.name,
    note: d.attributes?.note || d.note || undefined,
    featured: d.attributes?.featured || d.featured || false,
    breaking: d.attributes?.breaking || d.breaking || false,
    urgent: d.attributes?.urgent || d.urgent || false,
  };
}

export default function FactCheck() {
  const pathname = usePathname();
  const isFactCheckPage = pathname === '/fact-check';
  const [query, setQuery] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]); // Initialisé vide, plus de fallback statique
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('http://localhost:1337');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Indicateur de chargement pour l'API

  // 1. Gestion de l'hydratation et calcul de la bonne URL
  useEffect(() => {
    setIsHydrated(true);

    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const protocol = window.location.protocol;

      if (host !== 'localhost' && host !== '127.0.0.1') {
        // En prod, on retire le port 1337 par défaut
        setBaseUrl(`${protocol}//${host}`);
      }
    }
  }, []);

  // 2. Appel de l'API Strapi
  useEffect(() => {
    if (!isHydrated) return;

    let mounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getFactChecks();
        if (!mounted) return;
        
        if (res && Array.isArray((res as any).data)) {
          const items = (res as any).data.map((d: any) => mapFactCheckItem(d, baseUrl));
          setClaims(items);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données Strapi:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    
    return () => { mounted = false; };
  }, [isHydrated, baseUrl]); 

  const filtered = claims.filter((c) => c.claim.toLowerCase().includes(query.toLowerCase()));

  // Écran d'attente de sécurité pour l'hydratation côté client
  if (!isHydrated) {
    return (
      <section className="factcheck-section" aria-labelledby="factcheck-title" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="factcheck-header">
            <h2 id="factcheck-title">Section Fact-Check</h2>
            <p className="muted">Chargement de la section...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="factcheck-section" aria-labelledby="factcheck-title" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="factcheck-header">
          <h2 id="factcheck-title">Section Fact-Check</h2>
          <p className="muted">Vérifiez rapidement des affirmations, signalez une possible désinformation, ou consultez nos vérifications.</p>
        </div>

        <div className="factcheck-controls">
          <input
            type="search"
            placeholder="Rechercher une affirmation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            disabled={isLoading}
          />
          {!isFactCheckPage && (
            <Link href="/fact-check" className="btn-primary" style={{ marginLeft: 12 }}>
              Voir la base de vérifications →
            </Link>
          )}
        </div>

        {/* Affichage des fiches, de l'état de chargement ou d'une liste vide */}
        <div className="factcheck-list" style={{ marginTop: 20 }}>
          {isLoading ? (
            <p className="muted">Récupération des vérifications depuis Strapi...</p>
          ) : filtered.length > 0 ? (
            filtered.map((c) => (
              <article key={c.id} className={`factcard verdict-${c.verdict}`}>
                <div className="factcard-body">
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(c)}
                    style={{
                      cursor: 'pointer',
                      color: '#0066cc',
                      textDecoration: 'underline',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      font: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    {c.claim}
                  </button>
                </div>
                <div className="factcard-verdict">{getFactCheckVerdictLabel(c.verdict)}</div>
              </article>
            ))
          ) : (
            <p className="muted">Aucune vérification disponible pour le moment.</p>
          )}
        </div>
      </div>

      {/* Modal pour détails */}
      {selectedClaim && (
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
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 'clamp(16px, 5vw, 30px)'
          }}>
            <button
              onClick={() => setSelectedClaim(null)}
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

            <h2 style={{ marginBottom: '16px', paddingRight: '30px', fontWeight: 'bold', fontSize: 'clamp(18px, 5vw, 24px)' }}>{selectedClaim.claim}</h2>
            
            <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', color: '#111' }}>
              {getFactCheckVerdictLabel(selectedClaim.verdict)}
            </div>

            {selectedClaim.source && (
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                <strong>Source:</strong> {selectedClaim.source}
              </p>
            )}

            {selectedClaim.body && (
              <div 
                className="richtext-content"
                style={{ marginBottom: '16px' }}
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(selectedClaim.body) }}
              />
            )}

            {selectedClaim.mediaUrl && (
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                <img
                  src={selectedClaim.mediaUrl}
                  alt={selectedClaim.mediaName || "Media"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect fill="%23ddd" width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-family="Arial" font-size="16">Image non disponible</text></svg>';
                  }}
                  style={{ 
                    maxWidth: '100%', 
                    width: '100%',
                    height: 'auto', 
                    borderRadius: '4px',
                    display: 'block'
                  }}
                />
              </div>
            )}

            {selectedClaim.note && (
              <p style={{ fontSize: '13px', color: '#999', marginTop: '12px', fontStyle: 'italic' }}>
                {selectedClaim.note}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}