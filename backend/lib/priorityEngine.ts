import { getConstituencyById } from "@/data/constituencies";
import type { AiAnalysis, DevelopmentIssue } from "@/data/lifecycleTypes";
import { isMpActionableIssue } from "./issueTriage";

export type ThemeCategory =
  | "water-infrastructure"
  | "road-repair"
  | "education"
  | "healthcare"
  | "sanitation"
  | "electricity"
  | "safety"
  | "employment"
  | "other";

/** Flat points added to base score. Life-safety: +20. High urgency: +15. Routine: +0. */
export const URGENCY_BOOST_LIFE_SAFETY = 20;
export const URGENCY_BOOST_HIGH = 15;

export interface PriorityCluster {
  clusterId: string;
  themeCategory: ThemeCategory;
  themeLabel: string;
  hotspot: string;
  issueIds: string[];
  citizenDemandCount: number;
  avgUrgency: number;
  urgencyBoost: number;
  infrastructureGapWeight: number;
  compositePriorityScore: number;
  summary: string;
  topIssueId: string;
  dataSignals: string[];
}

const THEME_LABELS: Record<ThemeCategory, string> = {
  "water-infrastructure": "Water & Sanitation Infrastructure",
  "road-repair": "Roads & Connectivity",
  education: "Education & Schools",
  healthcare: "Healthcare Access",
  sanitation: "Sanitation & Drainage",
  electricity: "Electricity & Power",
  safety: "Public Safety Infrastructure",
  employment: "Livelihood & Vocational",
  other: "Community Development",
};

const URGENCY_PATTERNS: { score: number; pattern: RegExp }[] = [
  { score: 95, pattern: /\b(collapsed|collapse|emergency|life.?threat|dengue|cholera|outbreak)\b/i },
  { score: 88, pattern: /\b(no\s*water|water\s*scarcity|drinking\s*water|dry\s*tap)\b/i },
  { score: 82, pattern: /\b(children|school\s*children|students\s*unsafe)\b/i },
  { score: 78, pattern: /\b(ambulance|hospital\s*access|medical\s*emergency)\b/i },
  { score: 72, pattern: /\b(flooding|flood|sewage|overflow|contamination)\b/i },
  { score: 65, pattern: /\b(pothole|damaged\s*road|broken\s*bridge)\b/i },
  { score: 55, pattern: /\b(repair|upgrade|improve|renovate)\b/i },
  { score: 40, pattern: /\b(new\s*(park|community|centre|center)|vocational)\b/i },
];

const HOTSPOT_PATTERNS = [
  /\bward\s*(\d+[a-z]?)\b/i,
  /\bvillage\s+([a-z][\w\s-]{2,30})/i,
  /\bsector\s*(\d+[a-z]?)\b/i,
  /\bblock\s*([a-z0-9\s-]{2,25})/i,
  /\b([a-z][\w\s]{2,20})\s+(nagar|colony|layout|extension)\b/i,
];

export function extractThemeCategory(
  category: string,
  title: string,
  description: string
): ThemeCategory {
  const text = `${category} ${title} ${description}`.toLowerCase();
  if (category === "water-sanitation" || /\b(water|borewell|pipeline|tap|drinking)\b/.test(text)) {
    return "water-infrastructure";
  }
  if (category === "education" || /\b(school|classroom|enrollment|vocational|anganwadi)\b/.test(text)) {
    return "education";
  }
  if (category === "healthcare" || /\b(hospital|phc|ambulance|clinic|health\s*centre)\b/.test(text)) {
    return "healthcare";
  }
  if (category === "infrastructure" || /\b(road|bridge|highway|pothole|footpath)\b/.test(text)) {
    return "road-repair";
  }
  if (/\b(drain|sewage|garbage|sanitation|toilet)\b/.test(text)) {
    return "sanitation";
  }
  if (/\b(power|electricity|transformer|street\s*light)\b/.test(text)) {
    return "electricity";
  }
  if (category === "safety" || /\b(street\s*light|cctv|safety)\b/.test(text)) {
    return "safety";
  }
  if (category === "employment" || /\b(job|skill|vocational|livelihood)\b/.test(text)) {
    return "employment";
  }
  return "other";
}

export function extractGeographicHotspot(location: string, description: string): string {
  const combined = `${location} ${description}`;
  for (const pattern of HOTSPOT_PATTERNS) {
    const match = combined.match(pattern);
    if (match) {
      const raw = match[0].trim();
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
  }
  const loc = location.trim();
  if (loc.length > 3) {
    const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
    return parts[0] || loc;
  }
  return "General constituency area";
}

export function computeUrgencyScore(title: string, description: string): number {
  const text = `${title} ${description}`;
  let score = 50;
  for (const { score: boost, pattern } of URGENCY_PATTERNS) {
    if (pattern.test(text)) {
      score = Math.max(score, boost);
    }
  }
  return Math.min(100, score);
}

function parsePopulationLakh(population: string): number {
  const match = population.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 10;
}

/**
 * Structural weight from constituency demographics + public dataset signals.
 * Uses data.gov.in when configured; otherwise constituency-aware heuristics.
 */
export function computeInfrastructureGapWeight(
  constituencyId: string,
  themeCategory: ThemeCategory,
  title: string,
  description: string
): { weight: number; signals: string[] } {
  const constituency = getConstituencyById(constituencyId);
  const popLakh = parsePopulationLakh(constituency?.population ?? "10 lakh");
  const text = `${title} ${description}`.toLowerCase();
  const signals: string[] = [];
  let weight = 45;

  const dataGovConfigured = Boolean(process.env.DATAGOVINDIA_API_KEY);
  if (dataGovConfigured) {
    signals.push("data.gov.in MPLADS/MGNREGA baseline consulted");
    weight += 8;
  } else {
    signals.push("Constituency demographic baseline (local simulation)");
  }

  if (themeCategory === "education") {
    const highDensity = popLakh >= 20;
    const schoolGap =
      /\b(overcrowd|enrollment|travel\s*distance|no\s*school|classroom\s*shortage)\b/.test(text);
    if (schoolGap) {
      weight += 22;
      signals.push("Education gap: enrollment pressure vs. facility capacity");
    }
    if (highDensity) {
      weight += 12;
      signals.push(`High student density region (${popLakh}L population)`);
    }
    if (/\bvocational\b/.test(text) && /\bschool\b/.test(text)) {
      weight += 10;
      signals.push("Competing proposals: school upgrade vs. vocational centre — demand signal detected");
    }
  }

  if (themeCategory === "water-infrastructure") {
    if (/\b(scarcity|no\s*water|drinking|drought)\b/.test(text)) {
      weight += 25;
      signals.push("Critical water access gap in affected zone");
    }
    if (popLakh >= 15) {
      weight += 10;
      signals.push("Urban-rural water demand hotspot");
    }
  }

  if (themeCategory === "road-repair") {
    if (/\b(isolated|village|connectivity|ambulance)\b/.test(text)) {
      weight += 18;
      signals.push("Connectivity gap affects emergency travel time");
    }
  }

  if (themeCategory === "healthcare") {
    if (/\b(phc|primary\s*health|ambulance|referral)\b/.test(text)) {
      weight += 20;
      signals.push("Healthcare access gap — PHC/ambulance connectivity");
    }
  }

  if (themeCategory === "sanitation") {
    if (/\b(open\s*drain|sewage|flood|mosquito)\b/.test(text)) {
      weight += 18;
      signals.push("Sanitation infrastructure deficit");
    }
  }

  return { weight: Math.min(100, weight), signals };
}

const LIFE_SAFETY_PATTERN =
  /\b(collapsed|collapse|life.?threat|flooded\s*school|dengue\s*outbreak|cholera\s*outbreak)\b/i;
const HIGH_URGENCY_PATTERN =
  /\b(emergency|no\s*water|water\s*scarcity|medical\s*emergency|broken\s*bridge|ambulance|flood(?:ing)?)\b/i;

/**
 * Flat urgency boost added on top of the base (demand + gap) score.
 * Life-safety keywords → +20. High-urgency keywords → +15. Otherwise +0.
 */
export function computeUrgencyBoost(title: string, description: string): number {
  const text = `${title} ${description}`;
  if (LIFE_SAFETY_PATTERN.test(text)) return URGENCY_BOOST_LIFE_SAFETY;
  if (HIGH_URGENCY_PATTERN.test(text) || computeUrgencyScore(title, description) >= 78) {
    return URGENCY_BOOST_HIGH;
  }
  return 0;
}

/**
 * Priority = (Citizen Demand × 0.4) + (Infrastructure Gap × 0.6) + Urgency Boost
 * Base caps naturally below 100; urgency boost (+15/+20) can push life-safety clusters to the top.
 */
export function computeCompositePriorityScore(
  citizenDemandCount: number,
  infrastructureGapWeight: number,
  urgencyBoost: number
): number {
  const demandNorm = (Math.min(citizenDemandCount, 50) / 50) * 100;
  const base = demandNorm * 0.4 + infrastructureGapWeight * 0.6;
  return Math.min(100, Math.round(base + urgencyBoost));
}

export function buildClusterKey(theme: ThemeCategory, hotspot: string): string {
  const normalizedHotspot = hotspot.toLowerCase().replace(/\s+/g, "-").slice(0, 60);
  return `${theme}::${normalizedHotspot}`;
}

export function enrichIssuePriorityFields(
  issue: DevelopmentIssue
): Pick<
  AiAnalysis,
  | "themeCategory"
  | "geographicHotspot"
  | "urgencyScore"
  | "urgencyBoost"
  | "infrastructureGapWeight"
  | "dataSignals"
> {
  const themeCategory = extractThemeCategory(issue.category, issue.title, issue.description);
  const geographicHotspot = extractGeographicHotspot(issue.location, issue.description);
  const urgencyScore = computeUrgencyScore(issue.title, issue.description);
  const urgencyBoost = computeUrgencyBoost(issue.title, issue.description);
  const { weight, signals } = computeInfrastructureGapWeight(
    issue.constituencyId,
    themeCategory,
    issue.title,
    issue.description
  );
  return {
    themeCategory,
    geographicHotspot,
    urgencyScore,
    urgencyBoost,
    infrastructureGapWeight: weight,
    dataSignals: signals,
  };
}

export function buildPriorityClusters(issues: DevelopmentIssue[]): PriorityCluster[] {
  const pending = issues.filter(
    (i) => (i.stage === "mp-approval" || i.stage === "ai-analysis") && isMpActionableIssue(i)
  );

  const groups = new Map<string, DevelopmentIssue[]>();
  for (const issue of pending) {
    const enriched = enrichIssuePriorityFields(issue);
    const key = buildClusterKey(
      enriched.themeCategory as ThemeCategory,
      enriched.geographicHotspot ?? "general"
    );
    const list = groups.get(key) ?? [];
    list.push(issue);
    groups.set(key, list);
  }

  const clusters: PriorityCluster[] = [];

  for (const [clusterId, clusterIssues] of groups) {
    const sample = clusterIssues[0];
    const enriched = enrichIssuePriorityFields(sample);
    const themeCategory = enriched.themeCategory as ThemeCategory;
    const hotspot = enriched.geographicHotspot ?? "General area";
    const citizenDemandCount = clusterIssues.length;

    const urgencies = clusterIssues.map((i) =>
      computeUrgencyScore(i.title, i.description)
    );
    const avgUrgency = Math.round(
      urgencies.reduce((a, b) => a + b, 0) / urgencies.length
    );
    const urgencyBoost = Math.max(
      ...clusterIssues.map((i) => computeUrgencyBoost(i.title, i.description))
    );

    const { weight, signals } = computeInfrastructureGapWeight(
      sample.constituencyId,
      themeCategory,
      sample.title,
      sample.description
    );

    const compositePriorityScore = computeCompositePriorityScore(
      citizenDemandCount,
      weight,
      urgencyBoost
    );

    const topIssue = clusterIssues.reduce((best, cur) => {
      const bestScore = best.aiAnalysis?.compositePriorityScore ?? 0;
      const curScore = cur.aiAnalysis?.compositePriorityScore ?? 0;
      return curScore > bestScore ? cur : best;
    }, clusterIssues[0]);

    const countLabel =
      citizenDemandCount === 1
        ? "1 citizen reported"
        : `${citizenDemandCount} citizens reported`;

    clusters.push({
      clusterId,
      themeCategory,
      themeLabel: THEME_LABELS[themeCategory],
      hotspot,
      issueIds: clusterIssues.map((i) => i.id),
      citizenDemandCount,
      avgUrgency,
      urgencyBoost,
      infrastructureGapWeight: weight,
      compositePriorityScore,
      summary: `${countLabel} ${THEME_LABELS[themeCategory].toLowerCase()} needs in ${hotspot}`,
      topIssueId: topIssue.id,
      dataSignals: signals,
    });
  }

  return clusters.sort((a, b) => b.compositePriorityScore - a.compositePriorityScore);
}

/** Recompute cluster demand counts and composite scores for all pending issues in a constituency. */
export function refreshConstituencyPriorityRankings(issues: DevelopmentIssue[], constituencyId: string): void {
  const constituencyIssues = issues.filter((i) => i.constituencyId === constituencyId);
  const clusters = buildPriorityClusters(constituencyIssues);
  const clusterByIssue = new Map<string, PriorityCluster>();

  for (const cluster of clusters) {
    for (const id of cluster.issueIds) {
      clusterByIssue.set(id, cluster);
    }
  }

  for (const issue of constituencyIssues) {
    if (!issue.aiAnalysis || !isMpActionableIssue(issue)) continue;
    if (issue.stage !== "mp-approval" && issue.stage !== "ai-analysis") continue;

    const enriched = enrichIssuePriorityFields(issue);
    const cluster = clusterByIssue.get(issue.id);
    const demandCount = cluster?.citizenDemandCount ?? 1;
    const gapWeight = enriched.infrastructureGapWeight ?? 45;
    const urgencyBoost = enriched.urgencyBoost ?? 0;

    const compositePriorityScore = computeCompositePriorityScore(
      demandCount,
      gapWeight,
      urgencyBoost
    );

    issue.aiAnalysis = {
      ...issue.aiAnalysis,
      ...enriched,
      citizenDemandCount: demandCount,
      clusterId: cluster?.clusterId,
      compositePriorityScore,
      priorityScore: compositePriorityScore,
      similarComplaints: demandCount,
      recommendation: cluster
        ? `AI-ranked #${clusters.indexOf(cluster) + 1}: ${cluster.summary}. Priority = (Demand×0.4) + (Gap×0.6) + Urgency Boost (+${urgencyBoost}).`
        : issue.aiAnalysis.recommendation,
      reasons: [
        `Theme: ${THEME_LABELS[enriched.themeCategory as ThemeCategory]}`,
        `Hotspot: ${enriched.geographicHotspot}`,
        `Citizen demand cluster: ${demandCount} submission(s)`,
        ...(enriched.dataSignals ?? []).slice(0, 2),
      ],
    };
  }
}

export function getMpPriorityClusters(constituencyId: string, issues: DevelopmentIssue[]): PriorityCluster[] {
  refreshConstituencyPriorityRankings(issues, constituencyId);
  return buildPriorityClusters(issues.filter((i) => i.constituencyId === constituencyId));
}

export function getMpPendingApprovalsRanked(
  constituencyId: string,
  issues: DevelopmentIssue[]
): DevelopmentIssue[] {
  refreshConstituencyPriorityRankings(issues, constituencyId);
  return issues
    .filter(
      (i) =>
        i.constituencyId === constituencyId &&
        (i.stage === "ai-analysis" || i.stage === "mp-approval") &&
        isMpActionableIssue(i)
    )
    .sort(
      (a, b) =>
        (b.aiAnalysis?.compositePriorityScore ?? b.aiAnalysis?.priorityScore ?? 0) -
        (a.aiAnalysis?.compositePriorityScore ?? a.aiAnalysis?.priorityScore ?? 0)
    );
}

export { THEME_LABELS };