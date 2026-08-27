export function GridSkeleton({ count }: { count: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
      {items.map((i) => (
        <div key={i} className="shimmer rounded-2xl" style={{ aspectRatio: i % 3 === 0 ? "9 / 14" : "16 / 10" }} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  const items = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="row-scroller">
      {items.map((i) => (
        <div key={i} className="shimmer w-56 shrink-0 rounded-2xl sm:w-72" style={{ aspectRatio: "16 / 10" }} />
      ))}
    </div>
  );
}
