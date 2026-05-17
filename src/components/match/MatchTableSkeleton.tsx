import { t } from "@/lib/i18n/en-IN";

export function MatchTableSkeleton() {
  return (
    <div className="bg-op-surface border border-op-border rounded-lg overflow-hidden animate-pulse">
      <p className="md:hidden px-3 py-2 text-[11px] text-op-text-muted border-b border-op-border bg-op-row-alt">
        {t.table.scrollHint}
      </p>
      <div className="overflow-x-auto overscroll-x-contain touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[34rem]">
          <div className="h-10 bg-gray-100" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 border-t border-op-border flex gap-4 px-4 items-center"
            >
              <div className="h-4 w-16 bg-gray-200 rounded shrink-0" />
              <div className="h-4 flex-1 min-w-[10rem] bg-gray-200 rounded" />
              <div className="h-8 w-12 bg-gray-200 rounded shrink-0" />
              <div className="h-8 w-12 bg-gray-200 rounded shrink-0" />
              <div className="h-8 w-12 bg-gray-200 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
