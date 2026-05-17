export function MatchTableSkeleton() {
  return (
    <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-100" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 border-t border-op-border flex gap-4 px-4 items-center">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 flex-1 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
