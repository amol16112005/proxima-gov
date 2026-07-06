/** Inline SVG icons — reliable on Windows where emoji may not render. */

export function A11yIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="4" r="2" fill="currentColor" />
      <path
        d="M12 7v4M8 11l-4 6M16 11l4 6M7 11h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function CitizenPortalIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="36" height="28" rx="4" stroke="#60a5fa" strokeWidth="2" />
      <path d="M14 18h20M14 24h14M14 30h10" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="14" r="6" fill="#34d399" />
      <path d="M34 14l1.5 1.5L38 13" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MpPortalIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 36V18l14-8 14 8v18" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
      <rect x="18" y="24" width="12" height="12" stroke="#c4b5fd" strokeWidth="2" />
      <path d="M24 14v4" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function MicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}