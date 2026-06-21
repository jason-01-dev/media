"use client";

import Link from "next/link";
import { FaBroadcastTower } from "react-icons/fa";
import SearchBar from "@/components/SearchBar";
import UrgentBar from "@/components/UrgentBar";
import MobileNav from "@/components/MobileNav";

interface HeaderProps {
  categories?: any[];
}

const MENU_ITEMS = [
  { href: "/", label: "À la une" },
  { href: "/fact-check", label: "Fact-Checking" },
  { href: "/articles?category=economie", label: "Économie" },
  { href: "/articles?category=technologie", label: "Technologie" },
  { href: "/articles?category=analyses", label: "Analyses" },
];

export default function Header({ categories = [] }: Readonly<HeaderProps>) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="site-header" role="banner" aria-label="En-tête du site">
      <div className="header-top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-text">
            <span>{formattedDate}</span>
            <span className="live-badge">• En Direct de Kinshasa</span>
          </div>
          <div className="top-bar-links">
            <Link href="#" title="À propos" className="top-bar-link">À propos</Link>
            <Link href="#" title="Contact" className="top-bar-link">Contact</Link>
          </div>
        </div>
      </div>

      <div className="container header-inner">
        <Link
          href="/"
          className="site-logo"
          aria-label="Actu24 - Page d'accueil"
        >
          <span className="logo-mark" aria-hidden="true">
            <FaBroadcastTower className="logo-broadcast-icon" />
          </span>
          <span className="logo-text">Actu<span className="logo-number">24</span></span>
        </Link>

        <nav className="top-links" aria-label="Navigation principale">
          {MENU_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} title={item.label}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <SearchBar />
        </div>

        <MobileNav />
      </div>

      <UrgentBar />
    </header>
  );
}
