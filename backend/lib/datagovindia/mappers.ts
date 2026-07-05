import type { GovernmentProject, ProjectStatus } from "@/data/constituencies";
import type { DataGovIndiaRecord } from "./client";

function readNumber(row: DataGovIndiaRecord, ...keys: string[]): number {
  for (const key of keys) {
    const val = row[key];
    if (val !== null && val !== undefined && val !== "") {
      const n = Number(val);
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

/** Map MGNREGA district row → a transparency project card for the citizen dashboard. */
export function mgnregaRowToProject(
  row: DataGovIndiaRecord,
  index: number
): GovernmentProject | null {
  const district = String(row.district_name ?? row.District_Name ?? "");
  const ongoing = readNumber(
    row,
    "Number_of_Ongoing_Works",
    "number_of_ongoing_works"
  );
  const completed = readNumber(
    row,
    "Number_of_Completed_Works",
    "number_of_completed_works"
  );
  const totalWorks = readNumber(row, "Total_No_of_Works_Takenup", "total_no_of_works_takenup");
  const total = totalWorks || ongoing + completed;
  if (total === 0) return null;

  const progress = Math.round((completed / Math.max(total, 1)) * 100);
  const status: ProjectStatus =
    progress >= 90 ? "completed" : progress > 0 ? "in-progress" : "planned";

  const expenditureLakhs = readNumber(row, "Total_Exp", "total_exp");
  const expenditure = expenditureLakhs * 100_000;
  const finYear = String(row.fin_year ?? row.Fin_Year ?? "2024-2025");
  const month = String(row.month ?? row.Month ?? "");

  return {
    id: `MGNREGA-${district.replace(/\s+/g, "-").toUpperCase()}-${index}`,
    title: `MGNREGA Works — ${district}`,
    description: `${ongoing.toLocaleString("en-IN")} ongoing · ${completed.toLocaleString("en-IN")} completed works (FY ${finYear}${month ? ` · ${month}` : ""}, source: data.gov.in).`,
    department: "Ministry of Rural Development",
    budget: expenditure || 50_00_000,
    status,
    progress,
    startDate: "2025-04-01",
    expectedCompletion: "2026-03-31",
  };
}

/** Use real complaint volume from OGD to enrich AI priority score. */
export function extractComplaintVolume(row: DataGovIndiaRecord): number {
  return Number(row.total_complaints ?? row.complaints_received ?? row.count ?? 0);
}