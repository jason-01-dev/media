'use client';

import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl">!</div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">Une erreur est survenue</h2>
        <p className="mt-3 text-slate-600">
          Nous n'avons pas pu charger le contenu. Veuillez réessayer ou revenir à l'accueil.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => reset()} 
            className="rounded-full bg-slate-950 px-8 py-3 text-sm font-semibold text-white hover:bg-black transition"
          >
            Réessayer
          </button>
          <Link href="/" className="rounded-full border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-white">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
