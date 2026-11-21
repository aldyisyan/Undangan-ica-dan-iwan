const ITEMS = [
  { side: "left", top: "5%",   delay: 0,   dur: 18, size: 34, type: "floret", rotate: -12 },
  { side: "left", top: "15%",  delay: 2,   dur: 22, size: 20, type: "heart",  rotate: 10 },
  { side: "left", top: "30%",  delay: 1,   dur: 20, size: 32, type: "sprig",  rotate: -8 },
  { side: "left", top: "45%",  delay: 4,   dur: 24, size: 22, type: "floret", rotate: 20 },
  { side: "left", top: "60%",  delay: 3,   dur: 19, size: 26, type: "leaf",   rotate: -25 },
  { side: "left", top: "80%",  delay: 5,   dur: 21, size: 22, type: "heart",  rotate: 0 },
  
  { side: "right", top: "8%",  delay: 1.5, dur: 20, size: 28, type: "sprig",  rotate: 12 },
  { side: "right", top: "25%", delay: 0,   dur: 23, size: 30, type: "floret", rotate: -10 },
  { side: "right", top: "40%", delay: 4,   dur: 18, size: 30, type: "leaf",   rotate: 20 },
  { side: "right", top: "55%", delay: 1,   dur: 22, size: 22, type: "heart",  rotate: 0 },
  { side: "right", top: "70%", delay: 3,   dur: 25, size: 32, type: "floret", rotate: -15 },
  { side: "right", top: "85%", delay: 5.5, dur: 19, size: 28, type: "sprig",  rotate: 8 },
];

function Svg({ type, size }: { type: string; size: number }) {
  const s = size;
  if (type === "floret") return (
    <div className="depth-3d">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
        <ellipse cx="12" cy="6" rx="3" ry="5" opacity=".75" />
        <ellipse cx="12" cy="18" rx="3" ry="5" opacity=".75" />
        <ellipse cx="6" cy="12" rx="5" ry="3" opacity=".75" />
        <ellipse cx="18" cy="12" rx="5" ry="3" opacity=".75" />
        <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    </div>
  );
  if (type === "heart") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 20.6C10.4 19.3 3 14.4 3 8.9 3 5.6 5.4 3.6 8 3.6c1.9 0 3.3 1.1 4 2.3.7-1.2 2.1-2.3 4-2.3 2.6 0 5 2 5 5.3 0 5.5-7.4 10.4-9 11.7Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
  if (type === "leaf") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 22c0-8 5-14 10-16C18 8 14 14 12 22Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M12 22c0-8-5-14-10-16C6 8 10 14 12 22Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" opacity="0.5" />
      <path d="M12 10v12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
  if (type === "sprig") return (
    <svg width={s} height={s * 1.4} viewBox="0 0 24 34" fill="none">
      <path d="M12 32V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 24c-6-.5-10-5-11-11 6 .5 10 5 11 11Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M12 16c6-.5 10-5 11-11-6 .5-10 5-11 11Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M12 10c-5-.5-8-4-9-9 5 .5 8 4 9 9Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
  return (
    <svg width={s * 0.4} height={s * 0.4} viewBox="0 0 10 10">
      <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function FloatingAccents() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden>
      {ITEMS.map((item, i) => {
        const isLeft = item.side === "left";
        return (
          <div
            key={i}
            className={`absolute ${isLeft ? "text-terra/[0.12]" : "text-navy/[0.1]"}`}
            style={{
              [isLeft ? "left" : "right"]: `${6 + (i % 3) * 8}px`,
              top: item.top,
              transform: `rotate(${item.rotate}deg)`,
              animation: `float-accent-${i % 4} ${item.dur}s ease-in-out ${item.delay}s infinite`,
            }}
          >
            <Svg type={item.type} size={item.size} />
          </div>
        );
      })}

      <style>{`
        @keyframes float-accent-0 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)); }
          25% { transform: translate3d(6px, -14px, 0) rotate(calc(var(--r, 0deg) + 4deg)); }
          50% { transform: translate3d(-4px, -8px, 0) rotate(calc(var(--r, 0deg) - 3deg)); }
          75% { transform: translate3d(8px, -18px, 0) rotate(calc(var(--r, 0deg) + 5deg)); }
        }
        @keyframes float-accent-1 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)); }
          33% { transform: translate3d(-8px, -20px, 0) rotate(calc(var(--r, 0deg) - 6deg)); }
          66% { transform: translate3d(5px, -10px, 0) rotate(calc(var(--r, 0deg) + 3deg)); }
        }
        @keyframes float-accent-2 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)); }
          40% { transform: translate3d(10px, -16px, 0) rotate(calc(var(--r, 0deg) + 7deg)); }
          80% { transform: translate3d(-6px, -22px, 0) rotate(calc(var(--r, 0deg) - 4deg)); }
        }
        @keyframes float-accent-3 {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)); }
          20% { transform: translate3d(-5px, -12px, 0) rotate(calc(var(--r, 0deg) - 5deg)); }
          60% { transform: translate3d(7px, -24px, 0) rotate(calc(var(--r, 0deg) + 6deg)); }
        }
        @media (max-width: 768px) {
          .pointer-events-none.fixed.inset-0.z-10 > div { opacity: 0.4; }
        }
        @media (max-width: 480px) {
          .pointer-events-none.fixed.inset-0.z-10 > div { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pointer-events-none.fixed.inset-0.z-10 > div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
