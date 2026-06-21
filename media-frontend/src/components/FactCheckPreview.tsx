"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getFactChecks } from "@/lib/strapi";
import { parseMarkdownToHtml } from "@/lib/markdown";

interface Claim {
  id: number;
  claim: string;
  verdict: "verified" | "disputed" | "false";
  source?: string;
  body?: string;
  note?: string;
}

function getFactCheckVerdictLabel(verdict: Claim['verdict']) {
  if (verdict === 'verified') {
    return 'Vérifié';
  }

  if (verdict === 'disputed') {
    return 'Contesté';
  }

  return 'Faux';
}

export default function FactCheckPreview() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const res = await getFactChecks();
      if (!mounted) return;
      if (res && Array.isArray((res as any).data)) {
        const items = (res as any).data.slice(0, 5).map((d: any) => ({
          id: d.id,
          claim: d.attributes?.claim || d.claim || "",
          verdict: (d.attributes?.verdict || d.verdict) as Claim['verdict'] || 'disputed',
          source: d.attributes?.source || d.source || undefined,
          body: d.attributes?.body || d.body || undefined,
          note: d.attributes?.note || d.note || undefined,
        }));
        setClaims(items.length ? items : []);
      }
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (claims.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % claims.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [claims.length]);

  const activeClaim = claims[activeIndex] || null;

  if (claims.length === 0) {
    return (
      <section className="factcheck-section" aria-labelledby="factcheck-title">
        <div className="w-full px-4 md:px-6 py-16">
          <div className="factcheck-header">
            <h2 id="factcheck-title">Fact-Check</h2>
            <p className="muted">Aucune vérification disponible pour le moment. Vérifiez votre connexion ou la configuration de Strapi.</p>
          </div>
          <div className="factcheck-empty">
            <p>Les vérifications dynamiques apparaîtront ici dès que les données seront accessibles.</p>
            <Link href="/fact-check" className="btn-secondary mt-4">
              Voir la base de vérifications →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="factcheck-section" aria-labelledby="factcheck-title">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="factcheck-header">
          <h2 id="factcheck-title">Fact-Check</h2>
          <p className="muted">Vérifiez rapidement des affirmations et consultez nos vérifications dynamiques.</p>
        </div>

        {activeClaim && (
          <article className="factcheck-featured-card">
            <div className="factcheck-featured-badge">Actualité vérifiée</div>
            <h3>{activeClaim.claim}</h3>
            <div className="factcheck-featured-meta">
              <span className={`factcheck-verdict verdict-${activeClaim.verdict}`}>
                {getFactCheckVerdictLabel(activeClaim.verdict)}
              </span>
              {activeClaim.source && <span className="factcheck-source">Source: {activeClaim.source}</span>}
            </div>
            {activeClaim.body && (
              <div className="richtext-content" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(activeClaim.body) }} />
            )}
          </article>
        )}

        <div className="factcheck-list" style={{ marginTop: 24 }}>
          {claims.map((c, index) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`factcheck-mini-card ${index === activeIndex ? 'active' : ''}`}
            >
              <span className="factcheck-mini-title">{c.claim}</span>
              <span className={`factcheck-mini-verdict verdict-${c.verdict}`}>
                {getFactCheckVerdictLabel(c.verdict)}
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/fact-check" className="btn-primary">
            Voir la base de vérifications →
          </Link>
        </div>
      </div>
    </section>
  );
}
