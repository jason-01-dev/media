import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { getGlobal, getCategories } from "@/lib/strapi";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Link from "next/link";
import { FaBroadcastTower } from "react-icons/fa";
import Header from "@/components/Header";
import "./globals.css";
import "./styles/container.css";
import "./article.css";
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
      title: global?.siteName || "Media CMS",
      description: global?.siteDescription || "Strapi Media CMS",
      metadataBase: new URL(process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"),
    };
  } catch (err) {
    return {
      title: "Media CMS",
      description: "Strapi Media CMS",
      metadataBase: new URL(process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"),
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
    <html lang="en" suppressHydrationWarning>
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

        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <h4 className="footer-logo"><span className="logo-icon">📰</span> Actu 24</h4>
              <p>Votre source d'information fiable et quotidienne. Retrouvez les meilleures actualités.</p>
            </div>
            <div>
              <h5>Navigation</h5>
              <ul>
                <li><Link href="/">Accueil</Link></li>
                <li><Link href="/articles">Articles</Link></li>
                <li><Link href="/about">À propos</Link></li>
                <li><Link href="#">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5>Légal</h5>
              <ul>
                <li><Link href="#">Mentions légales</Link></li>
                <li><Link href="#">Confidentialité</Link></li>
                <li><Link href="#">Conditions d'utilisation</Link></li>
                <li><Link href="#">Cookies</Link></li>
              </ul>
            </div>
            <div>
              <h5>Contact</h5>
              <p>📧 contact@actu24.fr</p>
              <p>📱 +33 (0) 1 XX XX XX XX</p>
              <p className="social">Facebook • Twitter • LinkedIn</p>
            </div>
          </div>
          <div className="container copyright">
            © 2026 Actu 24. Tous droits réservés. | Powered by Strapi & Next.js
          </div>
        </footer>
      </body>
    </html>
  );
}
