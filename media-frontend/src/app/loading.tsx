export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        <p className="text-sm font-medium text-slate-500 tracking-wide">Chargement des actualités…</p>
      </div>
    </div>
  );
}
