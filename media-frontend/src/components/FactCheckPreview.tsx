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
    return ' vérifié';
  }

  if (verdict === 'disputed') {
    return ' contesté';
  }

  return ' faux';
}

export default function FactCheckPreview() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getFactChecks();
      if (!mounted) return;
      if (res && Array.isArray((res as any).data)) {
        const items = (res as any).data.slice(0, 3).map((d: any) => ({
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

  if (claims.length === 0) return null;

  return (
    <section className="factcheck-section" aria-labelledby="factcheck-title">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="factcheck-header">
          <h2 id="factcheck-title"> Fact-Check</h2>
          <p className="muted">Vérifiez rapidement des affirmations et consultez nos vérifications.</p>
        </div>

        <div className="factcheck-list" style={{ marginTop: 20 }}>
          {claims.map((c) => (
            <article key={c.id} className={`factcard verdict-${c.verdict}`}>
              <button
                type="button"
                onClick={() => setSelectedClaim(c)}
                className="factcard-body"
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  width: '100%',
                }}
              >
                <h3>{c.claim}</h3>
              </button>
              <div className="factcard-verdict">{getFactCheckVerdictLabel(c.verdict)}</div>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/fact-check" className="btn-primary">
            Voir la base de vérifications →
          </Link>
        </div>
      </div>

      {/* Modal for detailed view */}
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
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '30px'
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

            <h2 style={{ marginBottom: '16px', paddingRight: '30px', fontWeight: 'bold' }}>{selectedClaim.claim}</h2>

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
