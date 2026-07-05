import { CONSTITUENCIES } from "@/data/constituencies";
import type { AiAnalysis, ScopeVerdict } from "@/data/lifecycleTypes";

export interface IssueTriageResult {
  mpEligible: boolean;
  scopeVerdict: ScopeVerdict;
  citizenGuidance: string;
  suggestedAuthority: string;
  triageReasons: string[];
}

type Rule = {
  verdict: Exclude<ScopeVerdict, "eligible" | "out-of-constituency">;
  patterns: RegExp[];
  authority: string;
  guidance: string;
  reason: string;
};

const AUTHORITY_RULES: Rule[] = [
  {
    verdict: "not-mp-mandate",
    patterns: [
      /\b(passport|visa|oci|pio)\b/i,
      /\b(income\s*tax|gst|pan\s*card|aadhaar|uidai)\b/i,
      /\b(divorce|custody|matrimonial|alimony)\b/i,
      /\b(court\s*case|legal\s*dispute|bail|summons|lawyer)\b/i,
      /\b(railway\s*ticket|irctc|flight\s*booking|airport\s*authority)\b/i,
      /\b(bank\s*loan|personal\s*loan|credit\s*card\s*dispute)\b/i,
      /\b(give\s*me\s*a\s*job|appoint\s*me|personal\s*employment)\b/i,
    ],
    authority: "Relevant ministry, court, or service portal",
    guidance:
      "This appears to be a personal or central-service matter outside MPLADS/local development execution. Your MP office cannot process it as a constituency development issue.",
    reason: "Personal or central-service matter — not an MPLADS development issue",
  },
  {
    verdict: "wrong-authority",
    patterns: [
      /\b(police|fir|crime|theft\s*case|robbery|assault|missing\s*person)\b/i,
      /\b(electricity\s*bill|power\s*cut|discom|mseb|bescom|tangedco|msedcl)\b/i,
      /\b(property\s*tax|municipal\s*tax|water\s*tax|bmc|nmmc|ghmc)\b/i,
      /\b(state\s*highway|nh\s*authority|nhai\s*complaint)\b/i,
      /\b(university\s*admission|degree\s*verification|marksheet|cbse\s*result)\b/i,
      /\b(ration\s*card|pension\s*delay|pm\s*kisan\s*payment)\b/i,
    ],
    authority: "State government department, local municipal body, or police",
    guidance:
      "This issue falls under state or local executive authority. Your MP cannot directly execute relief here, though the MP office may forward it for escalation if needed.",
    reason: "Falls under state / municipal / police jurisdiction — not MP execution mandate",
  },
];

function normalizeText(...parts: string[]): string {
  return parts.join(" ").toLowerCase();
}

function detectOtherConstituency(
  location: string,
  description: string,
  citizenConstituencyId: string
): string | null {
  const text = normalizeText(location, description);
  for (const c of CONSTITUENCIES) {
    if (c.id === citizenConstituencyId) continue;
    const nameParts = c.name.toLowerCase().split(/\s+/).filter((p) => p.length > 3);
    const district = c.district.toLowerCase();
    const state = c.state.toLowerCase();

    if (text.includes(c.name.toLowerCase()) || text.includes(district)) {
      return c.name;
    }
    if (nameParts.length >= 2 && nameParts.every((p) => text.includes(p))) {
      return c.name;
    }
    if (text.includes(state) && !CONSTITUENCIES.find((x) => x.id === citizenConstituencyId)?.state.toLowerCase().includes(state)) {
      return `${c.name}, ${c.state}`;
    }
  }
  return null;
}

export function assessIssueScope(input: {
  constituencyId: string;
  category: string;
  title: string;
  description: string;
  location: string;
}): IssueTriageResult {
  const text = normalizeText(input.title, input.description, input.location);
  const triageReasons: string[] = [];

  const otherSeat = detectOtherConstituency(
    input.location,
    input.description,
    input.constituencyId
  );
  if (otherSeat) {
    const citizenSeat =
      CONSTITUENCIES.find((c) => c.id === input.constituencyId)?.name ?? "your constituency";
    return {
      mpEligible: false,
      scopeVerdict: "out-of-constituency",
      suggestedAuthority: `Lok Sabha MP for ${otherSeat}`,
      citizenGuidance: `The location you entered appears to be in ${otherSeat}, outside ${citizenSeat}. Lok Sabha MPs can only take up development issues within their own parliamentary constituency. Please contact the MP for ${otherSeat}, or resubmit with a location inside your registered constituency.`,
      triageReasons: [
        `Location references ${otherSeat}, which is outside the citizen's registered constituency (${citizenSeat}).`,
      ],
    };
  }

  for (const rule of AUTHORITY_RULES) {
    const matched = rule.patterns.find((p) => p.test(text));
    if (matched) {
      triageReasons.push(rule.reason);
      return {
        mpEligible: false,
        scopeVerdict: rule.verdict,
        suggestedAuthority: rule.authority,
        citizenGuidance: rule.guidance,
        triageReasons,
      };
    }
  }

  if (input.category === "employment") {
    const personalJob =
      /\b(i\s+need\s+a\s+job|give\s+me\s+job|appoint\s+me|my\s+unemployment|personal\s+job)\b/i.test(
        text
      );
    if (personalJob) {
      return {
        mpEligible: false,
        scopeVerdict: "not-mp-mandate",
        suggestedAuthority: "District Employment Exchange / Skill India portal",
        citizenGuidance:
          "Individual job requests are not constituency development issues under MPLADS. Please apply through the District Employment Exchange, Skill India, or relevant welfare schemes.",
        triageReasons: ["Individual employment request — not a community development project"],
      };
    }
  }

  triageReasons.push("Community development issue within constituency — suitable for MP review under MPLADS.");
  return {
    mpEligible: true,
    scopeVerdict: "eligible",
    suggestedAuthority: "Your Lok Sabha MP (MPLADS / constituency development)",
    citizenGuidance:
      "Your issue is within your MP's constituency development mandate and has been forwarded for MP review.",
    triageReasons,
  };
}

export function applyTriageToAnalysis(
  analysis: AiAnalysis,
  triage: IssueTriageResult
): AiAnalysis {
  return {
    ...analysis,
    mpEligible: triage.mpEligible,
    scopeVerdict: triage.scopeVerdict,
    citizenGuidance: triage.citizenGuidance,
    suggestedAuthority: triage.suggestedAuthority,
    triageReasons: triage.triageReasons,
    recommendation: triage.mpEligible
      ? analysis.recommendation
      : `Not forwarded to MP — ${triage.triageReasons[0] ?? "outside MP mandate"}.`,
  };
}

export function isMpActionableIssue(issue: {
  stage: string;
  aiAnalysis?: Pick<AiAnalysis, "mpEligible">;
}): boolean {
  return issue.stage !== "declined" && issue.aiAnalysis?.mpEligible !== false;
}