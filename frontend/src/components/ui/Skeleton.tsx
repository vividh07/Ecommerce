export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[8px] bg-surface-2 ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="product-tile">
      <Skeleton className="aspect-square w-full rounded-none bg-[#151515]" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
