export type SecurityHeader = { key: string; value: string };

/** Security headers applied to all routes via next.config.ts */
export const SECURITY_HEADERS: SecurityHeader[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-XSS-Protection", value: "0" },
];

export function productionHeaders(): SecurityHeader[] {
  if (process.env.NODE_ENV !== "production") return SECURITY_HEADERS;
  return [
    ...SECURITY_HEADERS,
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
  ];
}