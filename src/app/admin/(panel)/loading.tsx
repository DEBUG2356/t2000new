// Shown immediately while an admin page loads (navigation feels instant)
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-56 rounded bg-[#e5e7eb]" />
      <div className="rounded-lg bg-white p-4 shadow-sm">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="mb-3 h-9 rounded bg-[#f1f2f4] last:mb-0" />
        ))}
      </div>
    </div>
  );
}
