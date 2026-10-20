import { IconStar } from "./Icons";

export default function Stars({ value, className = "size-3.5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center text-star" aria-label={`${value} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const f = Math.max(0, Math.min(1, value - i));
        // round to halves like the original theme (full / half / empty)
        const r = f >= 0.75 ? 1 : f >= 0.25 ? 0.5 : 0;
        return <IconStar key={i} fill={r} className={className} />;
      })}
    </span>
  );
}
