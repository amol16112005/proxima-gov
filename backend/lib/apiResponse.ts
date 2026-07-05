import { NextResponse } from "next/server";

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function withCacheHeaders(response: NextResponse, maxAgeSec: number) {
  response.headers.set(
    "Cache-Control",
    `public, max-age=${maxAgeSec}, stale-while-revalidate=${maxAgeSec * 2}`
  );
  return response;
}