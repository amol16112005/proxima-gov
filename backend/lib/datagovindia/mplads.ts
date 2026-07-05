import { fetchDataGovResource } from "./client";
import { getDataGovMapping, DATA_GOV_RESOURCES } from "./resources";

export interface MpladsWorkRow {
  mpName: string;
  district: string;
  fundsReleasedCr: number;
  worksRecommendedCr: number;
  expenditureCr: number;
  utilizationPct: number;
}

export interface MpladsDistrictSummary {
  constituencyId: string;
  districts: string[];
  totalFundsReleasedCr: number;
  totalWorksRecommendedCr: number;
  totalExpenditureCr: number;
  utilizationPct: number;
  rows: MpladsWorkRow[];
  source: "data.gov.in" | "fallback";
  datasetTitle: string;
  period: string;
}

function parseCr(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function districtMatches(rowDistrict: string, targets: string[]): boolean {
  const d = rowDistrict.trim().toLowerCase();
  return targets.some((t) => d === t.toLowerCase() || d.includes(t.toLowerCase()));
}

export async function getMpladsSummaryForConstituency(
  constituencyId: string
): Promise<MpladsDistrictSummary> {
  const districts = getDataGovMapping(constituencyId)?.mpladsDistricts ?? [];
  const meta = DATA_GOV_RESOURCES.mpladsDistrict;

  const empty: MpladsDistrictSummary = {
    constituencyId,
    districts,
    totalFundsReleasedCr: 0,
    totalWorksRecommendedCr: 0,
    totalExpenditureCr: 0,
    utilizationPct: 0,
    rows: [],
    source: "fallback",
    datasetTitle: meta.title,
    period: meta.period,
  };

  if (!process.env.DATAGOVINDIA_API_KEY || districts.length === 0) {
    return empty;
  }

  try {
    const { resourceId, stateFilterField } = meta;
    const stateMplads = getDataGovMapping(constituencyId)?.stateMplads;
    if (!stateMplads) return empty;

    const response = await fetchDataGovResource({
      resourceId,
      limit: 500,
      filters: { [stateFilterField]: stateMplads },
    });

    const matched = response.records.filter((row) =>
      districtMatches(String(row.district ?? ""), districts)
    );

    const rows: MpladsWorkRow[] = matched.map((row) => {
      const fundsReleasedCr = parseCr(row.fund_received_goi__rs__crore_);
      const worksRecommendedCr = parseCr(row.works_recommended_cost__rs__crore_);
      const expenditureCr = parseCr(row.actual_expenditure_incurred_with_exp_admin__rs__crore_);
      const utilizationPct =
        fundsReleasedCr > 0 ? Math.round((expenditureCr / fundsReleasedCr) * 100) : 0;

      return {
        mpName: String(row.mp_name ?? "—"),
        district: String(row.district ?? "—"),
        fundsReleasedCr,
        worksRecommendedCr,
        expenditureCr,
        utilizationPct,
      };
    });

    const totalFundsReleasedCr = rows.reduce((s, r) => s + r.fundsReleasedCr, 0);
    const totalWorksRecommendedCr = rows.reduce((s, r) => s + r.worksRecommendedCr, 0);
    const totalExpenditureCr = rows.reduce((s, r) => s + r.expenditureCr, 0);
    const utilizationPct =
      totalFundsReleasedCr > 0
        ? Math.round((totalExpenditureCr / totalFundsReleasedCr) * 100)
        : 0;

    return {
      constituencyId,
      districts,
      totalFundsReleasedCr: Math.round(totalFundsReleasedCr * 100) / 100,
      totalWorksRecommendedCr: Math.round(totalWorksRecommendedCr * 100) / 100,
      totalExpenditureCr: Math.round(totalExpenditureCr * 100) / 100,
      utilizationPct,
      rows: rows.sort((a, b) => b.expenditureCr - a.expenditureCr),
      source: "data.gov.in",
      datasetTitle: response.title || meta.title,
      period: meta.period,
    };
  } catch (err) {
    console.warn("[data.gov.in MPLADS] fetch failed:", err);
    return empty;
  }
}