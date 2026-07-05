import type { GovernmentProject } from "@/data/constituencies";
import { fetchDataGovResource, type DataGovIndiaRecord } from "./client";
import { getDataGovMapping, DATA_GOV_RESOURCES } from "./resources";
import { mgnregaRowToProject } from "./mappers";

/**
 * Fetch live government projects for a constituency from data.gov.in.
 * Falls back to empty array if API key missing or fetch fails (demo still works).
 */
export async function getLiveProjectsForConstituency(
  constituencyId: string
): Promise<{ projects: GovernmentProject[]; source: "data.gov.in" | "fallback" }> {
  if (!process.env.DATAGOVINDIA_API_KEY) {
    return { projects: [], source: "fallback" };
  }

  const mapping = getDataGovMapping(constituencyId);
  if (!mapping) return { projects: [], source: "fallback" };

  try {
    const { resourceId, stateFilterField, districtFilterField } =
      DATA_GOV_RESOURCES.mgnregaDistrict;

    const filtered = await fetchDataGovResource({
      resourceId,
      limit: 100,
      filters: {
        [stateFilterField]: mapping.stateMgnrega,
        [districtFilterField]: mapping.districtMgnrega,
      },
    });

    let records = filtered.records;
    if (records.length === 0) {
      const all = await fetchDataGovResource({
        resourceId,
        limit: 500,
        filters: { [stateFilterField]: mapping.stateMgnrega },
      });
      const target = mapping.districtMgnrega.toLowerCase();
      records = all.records.filter((row) => {
        const dist = String(row[districtFilterField] ?? "").toLowerCase();
        return dist === target;
      });
    }

    const latestByDistrict = new Map<string, DataGovIndiaRecord>();
    for (const row of records) {
      const dist = String(row[districtFilterField] ?? "");
      if (!latestByDistrict.has(dist)) latestByDistrict.set(dist, row);
    }

    const projects = [...latestByDistrict.values()]
      .map((row, i) => mgnregaRowToProject(row, i))
      .filter((p): p is GovernmentProject => p !== null);

    return { projects, source: "data.gov.in" };
  } catch (err) {
    console.warn("[data.gov.in] fetch failed, using seed data:", err);
    return { projects: [], source: "fallback" };
  }
}