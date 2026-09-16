import React from "react";

/* ============================================================
   NIMBERLY'S — Decorative illustration kit
   Lightweight animated SVGs drawn from the logo's rainbow world.
   All decorative elements are aria-hidden.
   ============================================================ */

type SVGProps = React.SVGProps<SVGSVGElement>;

/** Logo rainbow arch (6 bands) */
export function RainbowArch({ className = "", ...props }: SVGProps) {
  const bands = ["#F43F6D", "#FF7A1F", "#FFC42E", "#7CC043", "#2FB9F1", "#D92E9C"];
  return (
    <svg viewBox="0 0 200 110" fill="none" aria-hidden className={className} {...props}>
      {bands.map((c, i) => (
        <path
          key={c}
          d={`M ${18 + i * 7} 102 A ${82 - i * 7} ${82 - i * 7} 0 0 1 ${182 - i * 7} 102`}
          stroke={c}
          strokeWidth="7"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/** Smiling sun with rotating rays */
export function Sun({
  className = "",
  face = true,
  ...props
}: SVGProps & { face?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className} {...props}>
      <g className="origin-center animate-spin-slow">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="57"
            y="4"
            width="6"
            height="18"
            rx="3"
            fill="#FFC42E"
            transform={`rotate(${i * 30} 60 60)`}
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="30" fill="#FFC42E" />
      <circle cx="60" cy="60" r="24" fill="#FFD35C" />
      {face && (
        <g>
          <circle cx="51" cy="55" r="3.4" fill="#2E3A54" />
          <circle cx="69" cy="55" r="3.4" fill="#2E3A54" />
          <path
            d="M50 66 Q60 74 70 66"
            stroke="#2E3A54"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="44" cy="64" r="4.5" fill="#F43F6D" opacity="0.55" />
          <circle cx="76" cy="64" r="4.5" fill="#F43F6D" opacity="0.55" />
        </g>
      )}
    </svg>
  );
}

/** Soft cloud */
export function Cloud({ className = "", color = "#FFFFFF", ...props }: SVGProps & { color?: string }) {
  return (
    <svg viewBox="0 0 140 80" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M30 66c-12 0-22-9-22-21 0-11 8-19 19-20C30 13 41 5 54 5c15 0 27 10 30 24 3-2 7-3 11-3 12 0 21 9 21 20 0 11-9 20-21 20H30z"
        fill={color}
      />
    </svg>
  );
}

/** Four-point sparkle star */
export function Sparkle({ className = "", color = "#FFC42E", ...props }: SVGProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M20 2c1.5 9.5 8 16.5 18 18-10 1.5-16.5 8.5-18 18-1.5-9.5-8-16.5-18-18 10-1.5 16.5-8.5 18-18z"
        fill={color}
      />
    </svg>
  );
}

/** Balloon on a wavy string */
export function Balloon({
  className = "",
  color = "#F43F6D",
  delay = 0,
  ...props
}: SVGProps & { color?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 60 130" fill="none" aria-hidden className={className} {...props}>
      <g style={{ animation: `float 6s ease-in-out ${delay}s infinite` }}>
        <path
          d="M30 6c12.7 0 22 9.6 22 22 0 14.5-13 25-22 25S8 42.5 8 28C8 15.6 17.3 6 30 6z"
          fill={color}
        />
        <ellipse cx="22" cy="20" rx="5" ry="8" fill="#fff" opacity="0.35" transform="rotate(-18 22 20)" />
        <path d="M26 52l4 6-6 1 4 5" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M30 64c4 10-8 14-3 24 4 8-2 14-5 18" stroke="#5b6880" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 6" />
      </g>
    </svg>
  );
}

/** Organic blob background shape */
export function Blob({
  className = "",
  color = "#FDE5EC",
  animated = true,
  ...props
}: SVGProps & { color?: string; animated?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${animated ? "animate-blob" : ""} ${className}`}
      style={{ backgroundColor: color, ...props.style }}
    />
  );
}

/** Hand-drawn squiggle divider */
export function Squiggle({
  className = "",
  color = "#7CC043",
  ...props
}: SVGProps & { color?: string }) {
  return (
    <svg viewBox="0 0 220 16" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M4 10 Q 18 2 32 10 T 60 10 T 88 10 T 116 10 T 144 10 T 172 10 T 200 10 T 228 10"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Wavy section divider (top of a section) */
export function WaveDivider({
  className = "",
  fill = "#FFFFFF",
  flip = false,
  ...props
}: SVGProps & { fill?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden
      className={`block h-[52px] w-full sm:h-[76px] ${flip ? "rotate-180" : ""} ${className}`}
      {...props}
    >
      <path
        d="M0 50c60-24 140-38 240-30 130 10 210 44 340 44 150 0 240-52 400-52 180 0 300 46 460 40v38H0V50z"
        fill={fill}
      />
    </svg>
  );
}

/** Little paper airplane trail */
export function PlaneTrail({ className = "", ...props }: SVGProps) {
  return (
    <svg viewBox="0 0 160 80" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M6 70 C 40 60, 52 34, 84 38 S 130 18, 148 10"
        stroke="#2FB9F1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 8"
      />
      <path d="M148 10l-16 2 6 12-2-11 12-3z" fill="#2FB9F1" />
    </svg>
  );
}

/** Stack of toy building blocks (logo-style) */
export function Blocks({ className = "", ...props }: SVGProps) {
  return (
    <svg viewBox="0 0 120 90" fill="none" aria-hidden className={className} {...props}>
      <rect x="10" y="52" width="34" height="30" rx="6" fill="#2278E0" />
      <rect x="47" y="52" width="34" height="30" rx="6" fill="#F43F6D" />
      <rect x="28" y="20" width="34" height="30" rx="6" fill="#FFC42E" />
      <path d="M84 34l16 10-16 10-16-10 16-10z" fill="#7CC043" />
      <circle cx="95" cy="70" r="12" fill="#2FB9F1" />
      <circle cx="95" cy="70" r="5" fill="#fff" opacity="0.5" />
      <path d="M45 35l7 7m0-7l-7 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Floating decorative cluster for section backgrounds */
export function FloatingDecor({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {variant === 1 && (
        <>
          <Cloud className="absolute left-[4%] top-[12%] w-28 opacity-80 animate-float-slow" color="#E2F5FD" />
          <Sparkle className="absolute right-[8%] top-[16%] w-8 animate-twinkle" />
          <Sparkle className="absolute right-[16%] bottom-[18%] w-5 animate-twinkle" color="#F43F6D" style={{ animationDelay: "1.2s" }} />
          <Cloud className="absolute right-[2%] bottom-[8%] w-36 opacity-70 animate-float" color="#FFF6DC" />
        </>
      )}
      {variant === 2 && (
        <>
          <Sparkle className="absolute left-[10%] top-[18%] w-7 animate-twinkle" color="#2FB9F1" />
          <Sparkle className="absolute left-[22%] bottom-[14%] w-4 animate-twinkle" color="#FF7A1F" style={{ animationDelay: "0.8s" }} />
          <Cloud className="absolute right-[6%] top-[10%] w-32 opacity-75 animate-float" color="#FDE5EC" />
          <Sparkle className="absolute right-[20%] bottom-[22%] w-6 animate-twinkle" style={{ animationDelay: "1.6s" }} />
        </>
      )}
      {variant === 3 && (
        <>
          <Cloud className="absolute left-[8%] top-[8%] w-24 opacity-70 animate-float-x" color="#ECF7E2" />
          <Sparkle className="absolute right-[12%] top-[14%] w-8 animate-twinkle" color="#D92E9C" style={{ animationDelay: "0.5s" }} />
          <Cloud className="absolute right-[4%] bottom-[12%] w-28 opacity-75 animate-float-slow" color="#E2F5FD" />
        </>
      )}
    </div>
  );
}
