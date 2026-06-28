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
  if (verdict === 'verified') {
    return 'Vérifié';
  }

  if (verdict === 'disputed') {
    return 'Contesté';
  }

  return 'Faux';
}

function getFactCheckVerdictTitle(verdict: Claim['verdict']) {
  if (verdict === 'verified') {
    return '✔️ Vérifié';
  }

  if (verdict === 'disputed') {
    return '⚠️ Contesté';
  }

  return '❌ Faux';
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

const FALLBACK: Claim[] = [
  { id: 1, claim: "Le vaccin X cause l'infertilité", verdict: "false", source: "WHO" },
  { id: 2, claim: "Le projet Y est financé par des fonds publics", verdict: "verified", source: "Rapport officiel" },
  { id: 3, claim: "Une vidéo montre une fraude massive", verdict: "disputed", source: "Analyse indépendante" },
];

export default function FactCheck() {
  const pathname = usePathname();
  const isFactCheckPage = pathname === '/fact-check';
  const [query, setQuery] = useState("");
  const [claims, setClaims] = useState<Claim[]>(FALLBACK);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('http://localhost:1337');
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated on client-side
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Determine base URL only on client-side after hydration
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof globalThis === 'undefined') return;

    const location = (globalThis as any).location;
    if (!location?.hostname) return;

    const host = location.hostname;
    const protocol = location.protocol || 'http:';

    if (host !== 'localhost' && host !== '127.0.0.1') {
      setBaseUrl(`${protocol}//${host}:1337`);
    }
  }, [isHydrated]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getFactChecks();
      if (!mounted) return;
      
      if (res && Array.isArray((res as any).data)) {
        const items = (res as any).data.map((d: any) => mapFactCheckItem(d, baseUrl));
        setClaims(items.length ? items : FALLBACK);
      } else {
        setClaims(FALLBACK);
      }
    })();
    return () => { mounted = false; };
  }, [baseUrl]);

  const filtered = claims.filter((c) => c.claim.toLowerCase().includes(query.toLowerCase()));

  // Don't render until hydrated to avoid Chrome extension mismatches
  if (!isHydrated) {
    return (
      <section className="factcheck-section" aria-labelledby="factcheck-title" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="factcheck-header">
            <h2 id="factcheck-title">Section Fact-Check</h2>
            <p className="muted">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="factcheck-section" aria-labelledby="factcheck-title" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!isFactCheckPage && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[2px] text-slate-400">Fact-checking</p>
              <h2 id="factcheck-title" className="text-2xl font-semibold tracking-tight text-white">Les vérifications du moment</h2>
            </div>
            <Link 
              href="/fact-check" 
              className="hidden md:inline-flex items-center rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white/90 hover:bg-white hover:text-slate-950 transition"
            >
              Voir tout →
            </Link>
          </div>
        )}

        <div className="mb-6">
          <input
            type="search"
            placeholder="Rechercher une affirmation ou un sujet..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/60"
          />
        </div>

        <div className="grid gap-3">
          {filtered.length > 0 ? filtered.map((c) => (
            <article 
              key={c.id} 
              onClick={() => setSelectedClaim(c)}
              className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 cursor-pointer transition hover:border-white/30 hover:bg-white/10 ${c.verdict === 'verified' ? 'border-l-4 border-l-emerald-500' : c.verdict === 'false' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500'}`}
            >
              <div className="flex-1">
                <p className="text-[15px] leading-snug text-white group-hover:underline">{c.claim}</p>
                {c.source && <span className="mt-1.5 block text-xs text-white/50">Source : {c.source}</span>}
              </div>

              <div className={`inline-flex shrink-0 items-center rounded-full px-4 py-1 text-xs font-semibold tracking-wider ${c.verdict === 'verified' ? 'bg-emerald-500/90 text-white' : c.verdict === 'false' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}`}>
                {getFactCheckVerdictTitle(c.verdict)}
              </div>
            </article>
          )) : (
            <div className="rounded-2xl border border-white/10 py-8 text-center text-white/60">Aucune vérification ne correspond à votre recherche.</div>
          )}
        </div>
      </div>

      {/* Professional Modal */}
      {selectedClaim && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedClaim(null)}
        >
          <div 
            className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider ${selectedClaim.verdict === 'verified' ? 'bg-emerald-600 text-white' : selectedClaim.verdict === 'false' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}`}>
                  {getFactCheckVerdictTitle(selectedClaim.verdict)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)} 
                className="text-2xl leading-none text-slate-400 hover:text-slate-900 transition"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 mb-4 pr-8">{selectedClaim.claim}</h2>

            {selectedClaim.source && (
              <div className="mb-4 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Source :</span> {selectedClaim.source}
              </div>
            )}

            {selectedClaim.body && (
              <div 
                className="prose prose-slate max-w-none text-[15px] leading-relaxed mb-6 text-slate-700"
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(selectedClaim.body) }} 
              />
            )}

            {selectedClaim.mediaUrl && (
              <div className="my-6 overflow-hidden rounded-xl border border-slate-100">
                <img
                  src={selectedClaim.mediaUrl}
                  alt={selectedClaim.mediaName || "Média de vérification"}
                  className="w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27300%27 height=%27200%27%3E%3Crect fill=%27%23f1f5f9%27 width=%27300%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27 fill=%27%2364758b%27 font-family=%27Arial%27 font-size=%2714%27%3EImage non disponible%3C/text%3E%3C/svg%27';
                  }}
                />
              </div>
            )}

            {selectedClaim.note && (
              <div className="mt-6 text-sm italic text-slate-500 border-l-4 border-slate-200 pl-4">
                {selectedClaim.note}
              </div>
            )}

            <div className="mt-8 text-right">
              <button 
                onClick={() => setSelectedClaim(null)} 
                className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
