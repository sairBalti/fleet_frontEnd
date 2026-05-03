import { useId } from "react";

/**
 * Same SVG wordmark as fleetWebsite (FleetMind AI) — the designed marketing site logo.
 * Gradient ids are unique per instance so multiple logos on one page work.
 */
function FleetMindIconMark({ className = "h-10 w-10" }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `fleetGradient-icon-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 60 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FleetMind AI"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="56" height="56" rx="16" fill={`url(#${gradId})`} />
      <path
        d="M15 37h23l-5 8H10l5-8zm6-18h27l-4 7H24l-3 4h19l-4 7H17l4-7h8l3-4h-15l4-7z"
        fill="#fff"
      />
      <circle cx="44" cy="45" r="4" fill="#0B1120" />
    </svg>
  );
}

function FleetMindWordmark({ className = "h-10 w-auto" }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `fleetGradient-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 220 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FleetMind AI"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="56" height="56" rx="16" fill={`url(#${gradId})`} />
      <path
        d="M15 37h23l-5 8H10l5-8zm6-18h27l-4 7H24l-3 4h19l-4 7H17l4-7h8l3-4h-15l4-7z"
        fill="#fff"
      />
      <circle cx="44" cy="45" r="4" fill="#0B1120" />
      <text x="70" y="30" fontSize="22" fontWeight="700" fill="#0B1120">
        FleetMind
      </text>
      <text x="70" y="48" fontSize="14" fontWeight="600" fill="#0F766E">
        AI Fleet Platform
      </text>
    </svg>
  );
}

/**
 * `theme`:
 * - sidebar — app nav (light background)
 * - sidebarCompact — collapsed rail (icon only)
 * - hero — login marketing panel (logo on light card for correct contrast)
 * - authForm — above login/signup forms
 */
export default function BrandLogo({ theme = "sidebar" }) {
  if (theme === "hero") {
    return (
      <div className="mb-6 rounded-xl bg-white/95 p-4 shadow-sm ring-1 ring-white/20">
        <FleetMindWordmark className="h-14 w-full max-w-[260px] object-contain object-left" />
      </div>
    );
  }

  if (theme === "authForm") {
    return (
      <div className="flex justify-center mb-4">
        <FleetMindWordmark className="h-11 w-auto max-w-[220px] object-contain" />
      </div>
    );
  }

  if (theme === "sidebarCompact") {
    return (
      <div className="mb-4 border-b border-neutral-100 pb-4 flex justify-center">
        <FleetMindIconMark className="h-10 w-10 shrink-0" />
      </div>
    );
  }

  return (
    <div className="mb-4 border-b border-neutral-100 pb-4 flex justify-center">
      <FleetMindWordmark className="h-10 w-auto max-w-[220px] object-contain" />
    </div>
  );
}
