import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { getGlobal, getCategories } from "@/lib/strapi";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Link from "next/link";
import { FaBroadcastTower } from "react-icons/fa";
import Header from "@/components/Header";
import "./globals.css";
import "./styles/container.css";
import "./articles/article.css";
import "./articles-responsive.css";
import "./articles-layout.css";
import "./highlight-sections.css";
import "./advanced-search.css";
import "./pagination.css";
import "./sidebar-statistics.css";
import "./styles/sponsored-section.css";
import "./styles/advertisement.css";
import "@/styles/richtext.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const globalData = await getGlobal();
    const global = globalData?.data;

    return {
      title: {
        default: global?.siteName || "Actu 24 | L'Information Décryptée",
        template: "%s | Actu 24",
      },
      description: global?.siteDescription || "Actu 24 — Votre source d'actualité fiable, analyses et vérification des faits en temps réel.",
      metadataBase: new URL("https://actu24.example.com"), // Change to your real domain in production
      icons: {
        icon: "/favicon.ico",
      },
      alternates: {
        languages: {
          'fr-FR': '/',
        },
      },
    };
  } catch (err) {
    return {
      title: "Actu 24 | L'Information Décryptée",
      description: "Actualité, analyses et fact-checking en continu.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categoriesData = await getCategories().catch(() => null);
  const categories = categoriesData?.data || [];

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B2540" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-white`}
      >
        <a href="#main-content" className="skip-link" style={{position:'absolute',left:-9999,top:'auto',width:1,height:1,overflow:'hidden'}}>Skip to content</a>
        <Header categories={categories} />

        <main className="site-main">
          <div id="main-content">{children}</div>
        </main>

        <ServiceWorkerRegister />

        <footer className="border-t border-slate-200 bg-white py-10 mt-16 text-sm">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
            <div>
              <div className="font-serif font-bold text-xl tracking-tighter mb-2">Actu 24</div>
              <p className="text-slate-600">L’information décryptée.<br />Indépendance • Rigueur • Transparence.</p>
            </div>
            <div>
              <div className="font-semibold mb-2.5 text-slate-900">Navigation</div>
              <ul className="space-y-1 text-slate-600">
                <li><Link href="/">Accueil</Link></li>
                <li><Link href="/articles">Toute l’actualité</Link></li>
                <li><Link href="/fact-check">Fact-checking</Link></li>
                <li><Link href="/about">À propos</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2.5 text-slate-900">Sections</div>
              <ul className="space-y-1 text-slate-600">
                <li>Politique</li>
                <li>Économie</li>
                <li>Société</li>
                <li>International</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2.5 text-slate-900">Contact &amp; Légal</div>
              <div className="text-slate-600 space-y-1">
                <p>contact@actu24.fr</p>
                <p className="text-xs mt-4">© {new Date().getFullYear()} Actu 24 — Tous droits réservés.</p>
                <div className="text-[11px] text-slate-400 mt-1">Propulsé par Strapi &amp; Next.js</div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
