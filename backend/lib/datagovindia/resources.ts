// Curated data.gov.in resource IDs relevant to Proxima Gov.
// Find more at https://data.gov.in — open any dataset → "API" tab → copy resource UUID.

export const DATA_GOV_RESOURCES = {
  mgnregaDistrict: {
    resourceId: "ee03643a-ee4c-48c2-ac30-9f2ff26ab722",
    stateFilterField: "state_name",
    districtFilterField: "district_name",
  },
  cpgrams: {
    resourceId: "REPLACE_WITH_CPGRAMS_RESOURCE_ID",
    ministryFilterField: "ministry",
  },
  mpladsDistrict: {
    resourceId: "c47410c8-4f8c-481f-b4f4-1d0f058c3f76",
    stateFilterField: "state_ut",
    districtFilterField: "district",
    title: "MPLADS — Funds Allocated, Recommended and Utilized (May 2020 – Nov 2021)",
    period: "May 2020 – November 2021",
  },
} as const;

export interface ConstituencyDataGovMapping {
  stateMgnrega: string;
  stateMplads: string;
  districtMgnrega: string;
  mpladsDistricts: string[];
}

/** Lok Sabha constituency → data.gov.in state/district filters. */
export const CONSTITUENCY_DATA_GOV: Record<string, ConstituencyDataGovMapping> = {
  "mumbai-south": { stateMgnrega: "MAHARASHTRA", stateMplads: "Maharashtra", districtMgnrega: "MUMBAI", mpladsDistricts: ["Mumbai City", "Mumbai"] },
  "pune-city": { stateMgnrega: "MAHARASHTRA", stateMplads: "Maharashtra", districtMgnrega: "PUNE", mpladsDistricts: ["Pune"] },
  "new-delhi": { stateMgnrega: "DELHI", stateMplads: "Delhi", districtMgnrega: "CENTRAL", mpladsDistricts: ["New Delhi", "Central Delhi"] },
  "bangalore-south": { stateMgnrega: "KARNATAKA", stateMplads: "Karnataka", districtMgnrega: "BANGALORE", mpladsDistricts: ["Bangalore", "Bengaluru Urban"] },
  "chennai-central": { stateMgnrega: "TAMIL NADU", stateMplads: "Tamil Nadu", districtMgnrega: "CHENNAI", mpladsDistricts: ["Chennai"] },
  "hyderabad": { stateMgnrega: "TELANGANA", stateMplads: "Telangana", districtMgnrega: "HYDERABAD", mpladsDistricts: ["Hyderabad"] },
  "kolkata-south": { stateMgnrega: "WEST BENGAL", stateMplads: "West Bengal", districtMgnrega: "KOLKATA", mpladsDistricts: ["Kolkata"] },
  "ahmedabad-east": { stateMgnrega: "GUJARAT", stateMplads: "Gujarat", districtMgnrega: "AHMEDABAD", mpladsDistricts: ["Ahmedabad"] },
  "lucknow": { stateMgnrega: "UTTAR PRADESH", stateMplads: "Uttar Pradesh", districtMgnrega: "LUCKNOW", mpladsDistricts: ["Lucknow"] },
  "jaipur": { stateMgnrega: "RAJASTHAN", stateMplads: "Rajasthan", districtMgnrega: "JAIPUR", mpladsDistricts: ["Jaipur"] },
  "bhopal": { stateMgnrega: "MADHYA PRADESH", stateMplads: "Madhya Pradesh", districtMgnrega: "BHOPAL", mpladsDistricts: ["Bhopal"] },
  "patna-sahib": { stateMgnrega: "BIHAR", stateMplads: "Bihar", districtMgnrega: "PATNA", mpladsDistricts: ["Patna"] },
  "ernakulam": { stateMgnrega: "KERALA", stateMplads: "Kerala", districtMgnrega: "ERNAKULAM", mpladsDistricts: ["Ernakulam"] },
  "guwahati": { stateMgnrega: "ASSAM", stateMplads: "Assam", districtMgnrega: "KAMRUP METRO", mpladsDistricts: ["Kamrup Metropolitan", "Kamrup Metro"] },
  "amritsar": { stateMgnrega: "PUNJAB", stateMplads: "Punjab", districtMgnrega: "AMRITSAR", mpladsDistricts: ["Amritsar"] },
};

/** @deprecated Use CONSTITUENCY_DATA_GOV */
export const CONSTITUENCY_TO_DISTRICT: Record<string, string> = Object.fromEntries(
  Object.entries(CONSTITUENCY_DATA_GOV).map(([id, m]) => [id, m.districtMgnrega])
);

/** @deprecated Use CONSTITUENCY_DATA_GOV */
export const CONSTITUENCY_TO_MPLADS_DISTRICTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(CONSTITUENCY_DATA_GOV).map(([id, m]) => [id, m.mpladsDistricts])
);

export function getDataGovMapping(constituencyId: string): ConstituencyDataGovMapping | undefined {
  return CONSTITUENCY_DATA_GOV[constituencyId];
}