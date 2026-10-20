// Icons used by the original tickets2000.com theme (paths taken from the archived markup)
type P = { className?: string };

export const IconBolt = ({ className }: P) => (
  <svg viewBox="0 0 351.3 522" className={className} fill="currentColor" aria-hidden>
    <path d="M325 192H204l19.3-162.6c.1-.8.1-3 .1-3C223.3 11.6 211.8 0 197 0c-8.4 0-16.2 4-21.4 11l-.1.1L5.2 266.6C1.9 271.1 0 276.8 0 282.3c0 14.8 11.6 26.3 26.3 26.3h99.9l-19.5 184.2c-.1.8-.1 2.7-.1 2.8 0 14.8 11.6 26.3 26.3 26.3 8.4 0 16.1-4 21.3-10.9l.1-.1 191.8-277c3.3-4.5 5.2-10.2 5.2-15.7 0-14.6-11.5-26.2-26.3-26.2zm-154.2 13.8c-.5 4.4.9 8.9 3.8 12.3 3 3.3 7.2 5.3 11.7 5.3l129.2-.1L140 476.8l19.3-182.1c.5-4.4-.9-8.8-3.9-12.2-3-3.3-7.2-5.2-11.6-5.2L36 276.9 189.6 46.5l-18.8 159.3z" />
  </svg>
);

export const IconMobile = ({ className }: P) => (
  <svg viewBox="0 0 310.1 525.8" className={className} fill="currentColor" aria-hidden>
    <path d="M154.1 488.9c12.4 0 22.5-10.1 22.5-22.5s-10.1-22.5-22.5-22.5-22.5 10.1-22.5 22.5 10.1 22.5 22.5 22.5zm0-30c4.1 0 7.5 3.4 7.5 7.5s-3.4 7.5-7.5 7.5-7.5-3.4-7.5-7.5 3.4-7.5 7.5-7.5z" />
    <path d="M265.1 1.4h-220c-23.7 0-43 19.3-43 43v437c0 23.7 19.3 43 43 43h220c23.7 0 43-19.3 43-43v-437c0-23.7-19.3-43-43-43zm-237 60v-17c0-9.4 7.6-17 17-17h220c9.4 0 17 7.6 17 17v17h-254zm30 360c0-7.2-5.8-13-13-13h-17v-321h254v321h-207c-7.2 0-13 5.8-13 13s5.8 13 13 13h207v47c0 9.4-7.6 17-17 17h-220c-9.4 0-17-7.6-17-17v-47h17c7.1 0 13-5.8 13-13z" />
    <path d="M184.1 35.4h-30c-5 0-9 4-9 9s4 9 9 9h30c5 0 9-4 9-9s-4.1-9-9-9z" />
    <circle cx="124.1" cy="44.4" r="9" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg viewBox="0 0 512 512" className={className} fill="currentColor" aria-hidden>
    <path d="M256 512c141.1 0 256-114.9 256-256S397.1 0 256 0 0 114.9 0 256s114.9 256 256 256zm0-477.9c122.4 0 221.9 99.5 221.9 221.9S378.4 477.9 256 477.9 34.1 378.4 34.1 256 133.6 34.1 256 34.1z" />
    <path d="M330.7 337.6c3.2 2.6 6.9 3.8 10.7 3.8 5 0 10-2.2 13.3-6.4 5.9-7.3 4.7-18.1-2.6-24l-78.9-63.1V119.5c0-9.4-7.7-17.1-17.1-17.1-9.4 0-17.1 7.7-17.1 17.1V256c0 5.2 2.4 10.1 6.4 13.3l85.3 68.3z" />
  </svg>
);

export const IconShield = ({ className }: P) => (
  <svg viewBox="0 0 436.8 524.9" className={className} fill="currentColor" aria-hidden>
    <path d="M421.8 68.9c-74.6-6.1-137-26.7-196.5-65-4.1-2.6-9.4-2.6-13.5 0-59.5 38.3-122 58.9-196.5 65-6.5.6-11.5 6.1-11.5 12.5v183.9c0 .7 0 1.3.1 2 8 48.6 32.6 100.8 69.5 146.9 39.2 49 87.7 86.3 140.3 107.8 1.6.6 3.1.9 4.7.9 1.5 0 3-.3 4.8-.9 52.6-21.6 101.1-58.9 140.3-107.8 36.9-46.1 61.6-98.3 69.5-146.9.1-.3.1-.7.1-1 0-.3 0-.5.1-.8V81.4c.1-6.4-5-11.9-11.4-12.5zm-13.5 23.9v171.5c-15.6 92.6-97.1 192.5-189.8 232.6-92.7-40.2-174.2-140-189.7-232.6V92.8c70.4-7.3 132.6-28.1 189.8-63.6 57.1 35.4 119.2 56.2 189.7 63.6z" />
    <circle cx="218" cy="245" r="70" fill="none" stroke="currentColor" strokeWidth="24" />
    <circle cx="190" cy="270" r="14" />
    <circle cx="245" cy="225" r="12" />
  </svg>
);

export const IconCalendar = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);

export const IconTicket = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8z" strokeLinejoin="round" />
    <path d="M14 6v12" strokeDasharray="2 2" />
  </svg>
);

export const IconLocation = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

export const IconSearch = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" strokeLinecap="round" />
  </svg>
);

export const IconChevron = ({ className, dir = "down" }: P & { dir?: "down" | "up" | "left" | "right" }) => {
  const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ transform: `rotate(${rot}deg)` }} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const IconShare = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
  </svg>
);

export const IconTick = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
    <path d="m4 12.5 5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconClose = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

export const IconMenu = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
  </svg>
);

export const IconFacebook = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2z" />
  </svg>
);

export const IconInstagram = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconStar = ({ className, fill = 1 }: P & { fill?: number }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <defs>
      <linearGradient id={`sg${Math.round(fill * 100)}`}>
        <stop offset={`${fill * 100}%`} stopColor="currentColor" />
        <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0.25" />
      </linearGradient>
    </defs>
    <path
      fill={`url(#sg${Math.round(fill * 100)})`}
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
    />
  </svg>
);
