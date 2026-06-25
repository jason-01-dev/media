"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getFactChecks } from "@/lib/strapi";

interface Claim {
  id: number;
  claim: string;
  verdict: "verified" | "disputed" | "false";
  source?: string;
  body?: string;
  note?: string;
}

function getFactCheckVerdictLabel(verdict: Claim['verdict']) {
  if (verdict === 'verified') return 'Vérifié';
  if (verdict === 'disputed') return 'Contesté';
  return 'Faux';
}

function getVerdictColorClass(verdict: Claim['verdict']) {
  if (verdict === 'verified') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (verdict === 'disputed') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
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
    }, 6000); // Aligné à 6 secondes pour un effet streaming dynamique

    return () => clearInterval(timer);
  }, [claims.length]);

  if (claims.length === 0) {
    return (
      <div className="text-slate-400 text-sm italic p-4 text-center">
        Aucune vérification en direct disponible.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {claims.map((c, index) => {
        const isActive = index === activeIndex;
        
        return (
          <div
            key={c.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-500 ${
              isActive 
                ? 'bg-slate-800 border-slate-700 shadow-md translate-x-1' 
                : 'bg-slate-900/40 border-slate-800/60 opacity-40 hover:opacity-70'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {/* Badge d'état streaming dynamique */}
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 mt-0.5 ${getVerdictColorClass(c.verdict)}`}>
                {getFactCheckVerdictLabel(c.verdict)}
              </span>
              
              {/* Affirmation (Bridée strictement sur une seule ligne pour le streaming) */}
              <h4 className="text-sm font-bold text-slate-100 line-clamp-1 min-w-0 leading-tight">
                {c.claim}
              </h4>
            </div>

            {/* Source de l'affirmation à droite */}
            {c.source && (
              <span className="text-[11px] text-slate-400 font-medium shrink-0 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/40">
                Source: {c.source}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}