import type { GovernmentProject } from "@/data/constituencies";
import { getConstituencyById } from "@/data/constituencies";
import type { MpPublicProfile } from "@/data/mpProfiles";
import { getMpProfileByConstituency } from "@/data/mpProfiles";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { getIssuesByConstituency } from "@/lib/lifecycleStore";
import { getLiveProjectsForConstituency } from "./index";
import { getMpladsSummaryForConstituency, type MpladsDistrictSummary } from "./mplads";

export interface MpTransparencyReport {
  profile: MpPublicProfile;
  constituencyName: string;
  mplads: MpladsDistrictSummary;
  mgnregaProjects: GovernmentProject[];
  lifecycleIssues: DevelopmentIssue[];
  constituencyProjects: GovernmentProject[];
  highlights: string[];
  sources: { label: string; live: boolean }[];
}

export async function buildMpTransparencyReport(
  constituencyId: string
): Promise<MpTransparencyReport | null> {
  const profile = getMpProfileByConstituency(constituencyId);
  const constituency = getConstituencyById(constituencyId);
  if (!profile || !constituency) return null;

  const [mplads, mgnrega] = await Promise.all([
    getMpladsSummaryForConstituency(constituencyId),
    getLiveProjectsForConstituency(constituencyId),
  ]);

  const lifecycleIssues = getIssuesByConstituency(constituencyId);
  const approved = lifecycleIssues.filter((i) => i.approval?.approved);
  const completed = lifecycleIssues.filter(
    (i) => i.stage === "completed" || i.stage === "impact-analysis"
  );
  const active = lifecycleIssues.filter((i) =>
    ["in-progress", "work-started", "mp-review", "citizen-verification"].includes(i.stage)
  );

  const highlights: string[] = [];

  if (mplads.source === "data.gov.in" && mplads.totalExpenditureCr > 0) {
    highlights.push(
      `₹${mplads.totalExpenditureCr.toFixed(2)} Cr MPLADS expenditure recorded in ${mplads.districts.join(", ")} (data.gov.in).`
    );
  }
  if (approved.length > 0) {
    highlights.push(`${approved.length} constituency issues approved through the Proxima lifecycle portal.`);
  }
  if (completed.length > 0) {
    highlights.push(`${completed.length} projects completed with citizen verification and impact tracking.`);
  }
  if (active.length > 0) {
    highlights.push(`${active.length} projects currently in active execution or MP review.`);
  }
  if (mgnrega.projects.length > 0) {
    highlights.push(
      `${mgnrega.projects[0].progress}% of MGNREGA works completed in the district (live data.gov.in).`
    );
  }
  if (highlights.length === 0) {
    highlights.push("Transparency data is being synced from data.gov.in for this constituency.");
  }

  return {
    profile,
    constituencyName: constituency.name,
    mplads,
    mgnregaProjects: mgnrega.projects,
    lifecycleIssues,
    constituencyProjects: constituency.projects,
    highlights,
    sources: [
      { label: "MPLADS (data.gov.in)", live: mplads.source === "data.gov.in" },
      { label: "MGNREGA (data.gov.in)", live: mgnrega.source === "data.gov.in" },
      { label: "Proxima lifecycle tracker", live: lifecycleIssues.length > 0 },
      { label: "Constituency project registry", live: constituency.projects.length > 0 },
    ],
  };
}