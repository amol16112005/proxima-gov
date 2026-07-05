// Server-side client for India's Open Government Data (OGD) platform — https://data.gov.in
// NEVER call this from client components; keep DATAGOVINDIA_API_KEY server-only.

const BASE_URL = "https://api.data.gov.in/resource";

export interface DataGovIndiaRecord {
  [key: string]: string | number | null | undefined;
}

export interface DataGovIndiaResponse {
  created: number;
  updated: number;
  title: string;
  desc: string;
  org: string[];
  source: string;
  catalog_uuid: string;
  sector: string[];
  fields: { id: string; name: string; type: string }[];
  records: DataGovIndiaRecord[];
  version: string;
  count: number;
  limit: string;
  offset: string;
  total: number;
  status: string;
}

export interface FetchResourceOptions {
  resourceId: string;
  limit?: number;
  offset?: number;
  format?: "json" | "csv" | "xml";
  filters?: Record<string, string>;
}

function getApiKey(): string {
  const key = process.env.DATAGOVINDIA_API_KEY;
  if (!key) {
    throw new Error(
      "Missing DATAGOVINDIA_API_KEY. Register at https://data.gov.in and add the key to .env.local"
    );
  }
  return key;
}

export async function fetchDataGovResource(
  options: FetchResourceOptions
): Promise<DataGovIndiaResponse> {
  const { resourceId, limit = 100, offset = 0, format = "json", filters = {} } = options;

  const params = new URLSearchParams({
    "api-key": getApiKey(),
    format,
    limit: String(limit),
    offset: String(offset),
  });

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(`filters[${key}]`, value);
  }

  const url = `${BASE_URL}/${resourceId}?${params.toString()}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 }, // cache 1 hour — OGD data updates infrequently
  });

  if (!res.ok) {
    throw new Error(`data.gov.in API error ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as DataGovIndiaResponse;
  if (data.status !== "ok") {
    throw new Error(`data.gov.in returned status: ${data.status}`);
  }
  return data;
}

/** Paginate through all records (OGD defaults to 10 per page). */
export async function fetchAllRecords(
  resourceId: string,
  filters?: Record<string, string>,
  pageSize = 100
): Promise<DataGovIndiaRecord[]> {
  const all: DataGovIndiaRecord[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const page = await fetchDataGovResource({ resourceId, limit: pageSize, offset, filters });
    all.push(...page.records);
    total = page.total;
    offset += pageSize;
    if (page.records.length === 0) break;
  }
  return all;
}