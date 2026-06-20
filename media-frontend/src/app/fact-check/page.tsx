"use client";
import FactCheck from "@/components/FactCheck";
import Link from "next/link";

export default function FactCheckPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <nav className="mb-6">
          <Link href="/">Accueil</Link>
          <span className="mx-2">/</span>
          <span>Fact-Check</span>
        </nav>

        <FactCheck />
      </main>
    </div>
  );
}
