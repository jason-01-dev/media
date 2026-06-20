"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SampleSelector() {
  const [layout, setLayout] = useState<number>(2);

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ textAlign: "center", color: "var(--alert)", fontSize: 30, marginBottom: 18 }}>Actu 24 — Choix du layout</h1>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }} className="controls">
        <button className={layout === 1 ? "btn active" : "btn"} onClick={() => setLayout(1)}>Layout 1</button>
        <button className={layout === 2 ? "btn active" : "btn"} onClick={() => setLayout(2)}>Layout 2</button>
        <button className={layout === 3 ? "btn active" : "btn"} onClick={() => setLayout(3)}>Layout 3</button>
      </div>

      <div style={{ minHeight: 480 }}>
        {layout === 1 && (
          <section className="section layout1">
            <div className="layout-title">📰 Layout 1: Classique 2 Colonnes</div>
            <div className="hero-figure" style={{ height: 380, marginTop: 12 }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('/images/sample-hero.jpg') center/cover" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, color: "#fff" }}>
                <span style={{ background: "var(--alert)", padding: "6px 12px", fontWeight: 900 }}>À LA UNE</span>
                <h2 style={{ fontSize: 28, marginTop: 8 }}>Titre principal du jour</h2>
                <p style={{ maxWidth: 600 }}>Extrait court décrivant l'actualité principale du jour, style sample.</p>
              </div>
            </div>
          </section>
        )}

        {layout === 2 && (
          <section className="section layout2">
            <div className="layout-title">🎬 Layout 2: Moderne (3 colonnes)</div>
            <div className="hero-figure" style={{ height: 420, marginTop: 12 }}>
              <div style={{ position: "absolute", inset: 0, background: "url('/images/sample-hero2.jpg') center/cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)" }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, color: "#fff", maxWidth: 900 }}>
                <span style={{ background: "var(--alert)", padding: "8px 14px", fontWeight: 900 }}>À LA UNE</span>
                <h2 style={{ fontSize: 36, marginTop: 12 }}>Titre layout 2 — mise en avant</h2>
                <p style={{ opacity: 0.95 }}>Extrait et chapeau comme sur le sample.</p>
              </div>
            </div>

            <div className="news-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 20 }}>
              {[1,2,3].map((n) => (
                <article key={n} className="news-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <div className="card-image" style={{ height: 180, background: '#f0f0f0' }} />
                  <div className="card-body" style={{ padding: 14 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>Titre carte {n}</h3>
                    <p style={{ color: '#666', fontSize: 13 }}>Résumé court de la carte pour présenter le contenu.</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {layout === 3 && (
          <section className="section layout3">
            <div className="layout-title">✨ Layout 3: Asymétrique Premium</div>
            <div className="top-section" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginTop: 12 }}>
              <div className="featured" style={{ height: 360, background: '#222' }} />
              <div className="secondary-list">
                {[1,2,3].map(i => (
                  <div key={i} className="sec-item" style={{ padding: 12, background: '#f9fafb', borderLeft: '4px solid var(--alert)', marginBottom: 12 }}>
                    <strong style={{ color: 'var(--alert)', marginRight: 8 }}>{String(i).padStart(2,'0')}</strong>
                    <div style={{ fontWeight: 800 }}>Titre secondaire {i}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <h3 style={{ fontWeight: 900 }}>Dernières actualités</h3>
              <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 12 }}>
                {Array.from({length:4}).map((_,i) => (
                  <div key={i} className="news-mini" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                    <div style={{ height: 120, background: '#f3f4f6' }} />
                    <div style={{ padding: 8 }}><h5 style={{ fontSize: 13, fontWeight: 700 }}>Titre mini</h5></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <Link href="/">
          <a className="btn" style={{ marginRight: 8 }}>Retour accueil</a>
        </Link>
        <button className="btn" onClick={() => alert('Pour appliquer ce layout, dis-moi lequel tu veux. Je l’intégrerai sur la page d’accueil.')}>Appliquer le layout sélectionné</button>
      </div>
    </div>
  );
}
