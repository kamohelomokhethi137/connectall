export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-ink/5 overflow-hidden animate-pulse">
      <div className="h-44 bg-ink/5" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-ink/10 rounded w-3/4" />
        <div className="h-3 bg-ink/5 rounded w-full" />
        <div className="h-3 bg-ink/5 rounded w-2/3" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
