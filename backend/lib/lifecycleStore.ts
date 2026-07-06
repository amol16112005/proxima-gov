import { SEED_ISSUES } from "@/data/seedIssues";
import type {
  AiAnalysis,
  DevelopmentIssue,
  LifecycleStage,
  MpReviewDecision,
  ProgressSubStage,
} from "@/data/lifecycleTypes";
import { SUB_STAGE_CONFIG } from "@/data/lifecycleTypes";
import { scheduleActivity } from "./cloud/activityLog";
import { persistIssue, persistIssueCounter } from "./cloud/persist";
import { applyTriageToAnalysis, assessIssueScope, isMpActionableIssue } from "./issueTriage";
import {
  enrichIssuePriorityFields,
  getMpPendingApprovalsRanked,
  getMpPriorityClusters,
  refreshConstituencyPriorityRankings,
} from "./priorityEngine";

export { getMpPriorityClusters } from "./priorityEngine";
import { canMarkWorkComplete, hasCompletionPhoto } from "./lifecycleRules";
import { addNotification } from "./notifications";

export { canMarkWorkComplete, hasCompletionPhoto } from "./lifecycleRules";
export { isMpActionableIssue } from "./issueTriage";

declare global {
   
  var __proximaIssues: DevelopmentIssue[] | undefined;
   
  var __proximaIssueCounter: number | undefined;
}

function issues(): DevelopmentIssue[] {
  if (!global.__proximaIssues) {
    global.__proximaIssues = SEED_ISSUES.map((i) => ({ ...i }));
  }
  return global.__proximaIssues;
}

function nextId(prefix: string): string {
  if (!global.__proximaIssueCounter) global.__proximaIssueCounter = 6000;
  global.__proximaIssueCounter += 1;
  persistIssueCounter(global.__proximaIssueCounter);
  return `${prefix}${global.__proximaIssueCounter}`;
}

function syncIssue(issue: DevelopmentIssue, summary: string, type: Parameters<typeof scheduleActivity>[0]["type"]): void {
  persistIssue(issue);
  scheduleActivity({
    type,
    summary,
    entityType: "issue",
    entityId: issue.id,
    issueId: issue.id,
    constituencyId: issue.constituencyId,
    citizenId: issue.citizenId,
    stage: issue.stage,
  });
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function generateAiAnalysis(
  title: string,
  description: string,
  category: string,
  location: string
): AiAnalysis {
  const hash = (title + description).length;
  const similar = 20 + (hash % 400);
  const score = Math.min(99, 70 + (hash % 30));
  const reasons: string[] = [];

  if (similar > 50) reasons.push(`${similar} similar complaints in the area`);
  if (description.toLowerCase().includes("school") || category === "education") {
    reasons.push("School route / education facility affected");
  } else {
    reasons.push("School within 2 km radius");
  }
  if (description.toLowerCase().includes("hospital") || category === "healthcare") {
    reasons.push("Hospital / ambulance access critical");
  } else if (hash % 2 === 0) {
    reasons.push("Hospital connectivity in affected zone");
  }
  if (description.toLowerCase().includes("village") || description.toLowerCase().includes("road")) {
    reasons.push("Connects isolated communities");
  }
  reasons.push(`Location: ${location}`);

  return {
    priorityScore: score,
    similarComplaints: similar,
    populationAffected: `${(1 + hash % 15) * 1000} residents`,
    schoolNearby: category === "education" || hash % 3 !== 0,
    hospitalConnectivity: category === "healthcare" || hash % 2 === 0,
    estimatedCost: (5 + (hash % 45)) * 1_00_000,
    reasons: reasons.slice(0, 4),
    recommendation: `Priority ${score >= 90 ? "immediate" : "scheduled"} allocation recommended based on AI triage.`,
    analyzedAt: new Date().toISOString(),
  };
}

export function getAllIssues(): DevelopmentIssue[] {
  return issues();
}

export function getIssueById(id: string): DevelopmentIssue | undefined {
  return issues().find((i) => i.id === id);
}

export function getIssuesByCitizen(citizenId: string): DevelopmentIssue[] {
  return issues().filter((i) => i.citizenId === citizenId);
}

export function getIssuesByConstituency(constituencyId: string): DevelopmentIssue[] {
  return issues().filter((i) => i.constituencyId === constituencyId);
}

export function getMpDashboardIssues(constituencyId: string): DevelopmentIssue[] {
  return getIssuesByConstituency(constituencyId).filter(isMpActionableIssue);
}

export function getActiveTransparencyIssues(constituencyId?: string): DevelopmentIssue[] {
  const activeStages: LifecycleStage[] = [
    "approved",
    "work-assigned",
    "tender-released",
    "work-started",
    "in-progress",
    "citizen-verification",
    "mp-review",
  ];
  return issues().filter(
    (i) =>
      activeStages.includes(i.stage) &&
      isMpActionableIssue(i) &&
      (!constituencyId || i.constituencyId === constituencyId)
  );
}

export function createIssue(data: {
  citizenId: string;
  citizenName: string;
  constituencyId: string;
  category: string;
  title: string;
  description: string;
  location: string;
}): DevelopmentIssue {
  const prefix =
    data.category === "infrastructure"
      ? "RD"
      : data.category === "water-sanitation"
        ? "WS"
        : data.category === "education"
          ? "ED"
          : "IS";

  const triage = assessIssueScope(data);
  const baseAnalysis = generateAiAnalysis(data.title, data.description, data.category, data.location);
  const priorityFields = enrichIssuePriorityFields({
    ...data,
    id: "pending",
    citizenName: data.citizenName,
    submittedAt: "",
    stage: "ai-analysis",
    currentProgress: 0,
    progressSubStage: "planning",
    beforeImageLabel: "",
    timeline: [],
    progressImages: [],
    verification: { yesVotes: 0, noVotes: 0, flagged: false, responses: [] },
  });
  const ai = applyTriageToAnalysis(
    { ...baseAnalysis, ...priorityFields },
    triage
  );
  const now = today();
  const mpEligible = triage.mpEligible;

  const issue: DevelopmentIssue = {
    id: nextId(prefix),
    ...data,
    submittedAt: new Date().toISOString(),
    stage: mpEligible ? "mp-approval" : "declined",
    currentProgress: 0,
    progressSubStage: "planning",
    beforeImageLabel: `Before — ${data.title}`,
    aiAnalysis: ai,
    timeline: [
      { date: now, label: "Issue Submitted", stage: "submitted" },
      { date: now, label: "AI Jurisdiction Scan", stage: "ai-analysis" },
      ...(mpEligible
        ? []
        : [{ date: now, label: "Not Taken Up by MP", stage: "declined" as const }]),
    ],
    progressImages: [],
    verification: { yesVotes: 0, noVotes: 0, flagged: false, responses: [] },
  };

  issues().unshift(issue);
  refreshConstituencyPriorityRankings(issues(), data.constituencyId);

  addNotification(data.citizenId, issue.id, `🟡 Issue #${issue.id} submitted successfully`);
  addNotification(
    data.citizenId,
    issue.id,
    `🤖 AI scan complete — Priority Score ${ai.priorityScore}/100`
  );

  if (mpEligible) {
    addNotification(data.citizenId, issue.id, `⏳ Awaiting MP approval for #${issue.id}`);
  } else {
    addNotification(
      data.citizenId,
      issue.id,
      `🚫 Issue #${issue.id} is outside MP mandate. ${triage.citizenGuidance}`
    );
    addNotification(
      data.citizenId,
      issue.id,
      `📌 Please contact: ${triage.suggestedAuthority}`
    );
  }

  syncIssue(
    issue,
    mpEligible
      ? `Issue submitted: ${issue.title}`
      : `Issue declined by AI triage: ${issue.title}`,
    "issue.created"
  );
  return issue;
}

function pushTimeline(issue: DevelopmentIssue, label: string, stage: LifecycleStage) {
  issue.timeline.push({ date: today(), label, stage });
}

export function mpApproveIssue(
  issueId: string,
  mpName: string,
  fund: string,
  budget: number
): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue || !issue.aiAnalysis) return undefined;

  issue.stage = "approved";
  issue.approval = {
    approved: true,
    fund,
    budget,
    approvalDate: today(),
    mpName,
  };
  issue.budget = { total: budget, spent: 0, deadline: "" };
  pushTimeline(issue, "MP Approval", "approved");

  if (issue.citizenId) {
    addNotification(issue.citizenId, issue.id, `🟢 MP approved #${issue.id} — Fund: ${fund}, Budget ₹${(budget / 100000).toFixed(0)} Lakhs`);
  }
  syncIssue(issue, `MP ${mpName} approved #${issue.id}`, "issue.mp_action");
  return issue;
}

export function mpAssignWork(
  issueId: string,
  contractor: string,
  officer: string,
  estimatedDays: number,
  deadline: string
): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue || !issue.approval) return undefined;

  issue.stage = "work-assigned";
  issue.workAssignment = { contractor, officer, estimatedDays, assignedAt: today() };
  if (issue.budget) issue.budget.deadline = deadline;
  pushTimeline(issue, "Work Assigned", "work-assigned");

  if (issue.citizenId) {
    addNotification(issue.citizenId, issue.id, `👷 Contractor assigned for #${issue.id}: ${contractor}`);
  }
  syncIssue(issue, `Work assigned to ${contractor} for #${issue.id}`, "issue.stage_changed");
  return issue;
}

export function mpReleaseTender(issueId: string): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue) return undefined;
  issue.stage = "tender-released";
  pushTimeline(issue, "Tender Released", "tender-released");
  if (issue.citizenId) {
    addNotification(issue.citizenId, issue.id, `📋 Tender released for #${issue.id}`);
  }
  syncIssue(issue, `Tender released for #${issue.id}`, "issue.stage_changed");
  return issue;
}

export function mpStartWork(issueId: string): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue) return undefined;
  issue.stage = "work-started";
  issue.currentProgress = 10;
  issue.progressSubStage = "planning";
  pushTimeline(issue, "Work Started", "work-started");
  if (issue.citizenId) {
    addNotification(issue.citizenId, issue.id, `🔔 Road Work Started — #${issue.id}`);
  }
  syncIssue(issue, `Work started on #${issue.id}`, "issue.stage_changed");
  return issue;
}

export function updateProgress(
  issueId: string,
  subStage: ProgressSubStage
): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue) return undefined;

  const config = SUB_STAGE_CONFIG.find((s) => s.key === subStage);
  if (!config) return undefined;

  if (subStage === "completed" && !canMarkWorkComplete(issue)) {
    return undefined;
  }

  issue.stage = subStage === "completed" ? "citizen-verification" : "in-progress";
  issue.progressSubStage = subStage;
  issue.currentProgress = config.progress;

  if (issue.budget && issue.approval) {
    issue.budget.spent = Math.round(issue.approval.budget * (config.progress / 100));
  }

  if (subStage === "completed") {
    issue.afterImageLabel = `After — ${issue.title}`;
    pushTimeline(issue, "Work Completed", "completed");
    if (issue.citizenId) {
      addNotification(issue.citizenId, issue.id, `🔔 Work Completed — Please verify #${issue.id}`);
    }
  } else if (issue.citizenId) {
    addNotification(issue.citizenId, issue.id, `🔔 ${config.progress}% Completed — #${issue.id}`);
  }

  checkDelayAlert(issue);
  syncIssue(
    issue,
    subStage === "completed"
      ? `Work completed on #${issue.id} — awaiting citizen verification`
      : `Progress updated to ${config.progress}% on #${issue.id}`,
    "issue.stage_changed"
  );
  return issue;
}

export function addProgressImage(
  issueId: string,
  label: string,
  caption: string,
  isCompletion = false,
  imageUrl?: string
): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue) return undefined;

  if (isCompletion && hasCompletionPhoto(issue)) {
    return undefined;
  }

  const week = issue.progressImages.length + 1;
  const baseGps: Record<string, { lat: number; lng: number }> = {
    "mumbai-south": { lat: 18.922, lng: 72.8347 },
    "pune-city": { lat: 18.5074, lng: 73.8077 },
    "new-delhi": { lat: 28.6139, lng: 77.209 },
    "bangalore-south": { lat: 12.9141, lng: 77.6101 },
    "chennai-central": { lat: 13.0827, lng: 80.2707 },
    hyderabad: { lat: 17.385, lng: 78.4867 },
    "kolkata-south": { lat: 22.5134, lng: 88.3566 },
    "ahmedabad-east": { lat: 23.0225, lng: 72.5714 },
    lucknow: { lat: 26.8467, lng: 80.9462 },
    jaipur: { lat: 26.9124, lng: 75.7873 },
    bhopal: { lat: 23.2599, lng: 77.4126 },
    "patna-sahib": { lat: 25.5941, lng: 85.1376 },
    ernakulam: { lat: 9.9312, lng: 76.2673 },
    guwahati: { lat: 26.1445, lng: 91.7362 },
    amritsar: { lat: 31.634, lng: 74.8723 },
  };
  const gps = baseGps[issue.constituencyId] ?? { lat: 19.0, lng: 73.0 };

  issue.progressImages.push({
    week,
    label,
    caption,
    gps: { lat: gps.lat + week * 0.0001, lng: gps.lng + week * 0.0001 },
    capturedAt: new Date().toISOString(),
    verified: true,
    isCompletion,
    imageUrl,
  });

  if (isCompletion) {
    issue.afterImageLabel = `After — ${issue.title}`;
  }

  syncIssue(
    issue,
    isCompletion
      ? `Completion photo uploaded for #${issue.id}`
      : `Progress photo (week ${week}) uploaded for #${issue.id}`,
    "issue.progress_photo"
  );
  return issue;
}

function generateImpactAnalysis(issue: DevelopmentIssue) {
  return {
    period: "3 months post-completion (projected)",
    before: {
      complaints: issue.aiAnalysis?.similarComplaints ?? 100,
      travelTimeMin: 45,
      schoolAttendance: 82,
      ambulanceDelayMin: 35,
    },
    after: {
      complaints: Math.round((issue.aiAnalysis?.similarComplaints ?? 100) * 0.04),
      travelTimeMin: 18,
      schoolAttendance: 91,
      ambulanceDelayMin: 15,
    },
    summary: `Measurable improvement across connectivity, safety, and service access metrics for ${issue.location}.`,
  };
}

function citizenVerdictFromVotes(yesVotes: number, noVotes: number): "approved" | "rejected" | "mixed" {
  if (noVotes > 0 && yesVotes === 0) return "rejected";
  if (yesVotes > 0 && noVotes === 0) return "approved";
  return "mixed";
}

export function citizenVerify(
  issueId: string,
  citizenId: string,
  vote: "yes" | "no"
): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue || issue.stage !== "citizen-verification") return undefined;
  if (!issue.verification) {
    issue.verification = { yesVotes: 0, noVotes: 0, flagged: false, responses: [] };
  }

  const existing = issue.verification.responses.find((r) => r.citizenId === citizenId);
  if (existing) return issue;

  issue.verification.responses.push({ citizenId, vote, at: new Date().toISOString() });
  if (vote === "yes") issue.verification.yesVotes += 1;
  else issue.verification.noVotes += 1;

  if (issue.verification.noVotes >= 1) {
    issue.verification.flagged = true;
  }

  const isSubmitter = issue.citizenId === citizenId;
  const total = issue.verification.yesVotes + issue.verification.noVotes;

  if (isSubmitter || total >= 3) {
    issue.stage = "mp-review";
    issue.mpReview = {
      citizenVerdict: citizenVerdictFromVotes(
        issue.verification.yesVotes,
        issue.verification.noVotes
      ),
      citizenFeedbackAt: new Date().toISOString(),
      yesVotes: issue.verification.yesVotes,
      noVotes: issue.verification.noVotes,
      accountability: [],
    };
    pushTimeline(issue, "Citizen feedback received — awaiting MP review", "mp-review");

    if (issue.citizenId) {
      const verdict =
        vote === "yes"
          ? "confirmed work is complete"
          : "reported the work is NOT satisfactory";
      addNotification(
        issue.citizenId,
        issue.id,
        `🏛️ Your review for #${issue.id} (${verdict}) is with your MP for accountability review.`
      );
    }
  }

  syncIssue(
    issue,
    `Citizen voted "${vote}" on #${issue.id}`,
    "issue.citizen_verify"
  );
  return issue;
}

export function mpReviewIssue(
  issueId: string,
  decision: MpReviewDecision,
  mpName: string,
  note?: string
): DevelopmentIssue | undefined {
  const issue = getIssueById(issueId);
  if (!issue || issue.stage !== "mp-review") return undefined;

  if (!issue.mpReview) {
    issue.mpReview = {
      citizenVerdict: "mixed",
      citizenFeedbackAt: new Date().toISOString(),
      yesVotes: issue.verification?.yesVotes ?? 0,
      noVotes: issue.verification?.noVotes ?? 0,
      accountability: [],
    };
  }

  const contractor = issue.workAssignment?.contractor ?? "Assigned contractor";
  const officer = issue.workAssignment?.officer ?? "Supervising officer";
  const reviewNote = note?.trim() || "No additional note provided.";

  switch (decision) {
    case "approve-closure":
      issue.stage = "completed";
      issue.currentProgress = 100;
      issue.progressSubStage = "completed";
      issue.impactAnalysis = generateImpactAnalysis(issue);
      pushTimeline(issue, `MP approved closure — ${mpName}`, "completed");
      pushTimeline(issue, "Impact Analysis", "impact-analysis");
      if (issue.citizenId) {
        addNotification(
          issue.citizenId,
          issue.id,
          `✅ MP approved closure of #${issue.id}. Impact analysis published.`
        );
      }
      break;

    case "reopen-contractor":
      issue.stage = "in-progress";
      issue.progressSubStage = "construction";
      issue.currentProgress = 65;
      issue.mpReview.accountability.push({
        party: "contractor",
        action: "Work reopened — contractor held responsible",
        note: reviewNote,
        mpName,
        at: new Date().toISOString(),
      });
      issue.delayAlert = {
        active: true,
        reason: `Citizen rejected completion. Contractor ${contractor} must redo work.`,
        daysStalled: 0,
        expectedCompletion: issue.budget?.deadline ?? "TBD",
        currentCompletion: issue.currentProgress,
        recommendation: `Notice issued to ${contractor}. MP ${mpName} ordered rework.`,
      };
      pushTimeline(issue, `MP reopened work — contractor accountable (${contractor})`, "in-progress");
      if (issue.citizenId) {
        addNotification(
          issue.citizenId,
          issue.id,
          `⚠️ MP reopened #${issue.id}. Contractor ${contractor} held responsible.`
        );
      }
      break;

    case "escalate-officer":
      issue.stage = "in-progress";
      issue.progressSubStage = "quality-inspection";
      issue.currentProgress = 90;
      issue.mpReview.accountability.push({
        party: "officer",
        action: "Escalated to supervising officer for oversight failure",
        note: reviewNote,
        mpName,
        at: new Date().toISOString(),
      });
      issue.delayAlert = {
        active: true,
        reason: `Supervision lapse flagged. Officer ${officer} escalated by MP.`,
        daysStalled: 0,
        expectedCompletion: issue.budget?.deadline ?? "TBD",
        currentCompletion: issue.currentProgress,
        recommendation: `Departmental inquiry against ${officer}. MP ${mpName} monitoring.`,
      };
      pushTimeline(issue, `MP escalated to officer (${officer})`, "in-progress");
      if (issue.citizenId) {
        addNotification(
          issue.citizenId,
          issue.id,
          `🏛️ MP escalated #${issue.id} to supervising officer ${officer}.`
        );
      }
      break;

    case "reject-reinspect":
      issue.stage = "in-progress";
      issue.progressSubStage = "quality-inspection";
      issue.currentProgress = 90;
      issue.verification = issue.verification
        ? { ...issue.verification, flagged: true }
        : { yesVotes: 0, noVotes: 1, flagged: true, responses: [] };
      issue.mpReview.accountability.push({
        party: "contractor",
        action: "Quality inspection failed — mandatory re-inspection ordered",
        note: reviewNote,
        mpName,
        at: new Date().toISOString(),
      });
      pushTimeline(issue, "MP ordered quality re-inspection", "in-progress");
      if (issue.citizenId) {
        addNotification(
          issue.citizenId,
          issue.id,
          `🔍 MP ordered re-inspection for #${issue.id} after your review.`
        );
      }
      break;
  }

  syncIssue(issue, `MP review: ${decision} on #${issue.id}`, "issue.mp_action");
  return issue;
}

export function getMpPendingReviews(constituencyId: string): DevelopmentIssue[] {
  return issues().filter(
    (i) => i.constituencyId === constituencyId && i.stage === "mp-review"
  );
}

function checkDelayAlert(issue: DevelopmentIssue): void {
  if (issue.stage !== "in-progress" || issue.currentProgress < 30) return;
  const lastEvent = issue.timeline[issue.timeline.length - 1];
  if (!lastEvent) return;

  const daysSince = Math.floor(
    (Date.now() - new Date(lastEvent.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince >= 28 && issue.currentProgress < 70) {
    issue.delayAlert = {
      active: true,
      reason: `No progress for ${daysSince} days`,
      daysStalled: daysSince,
      expectedCompletion: issue.budget?.deadline ?? "TBD",
      currentCompletion: issue.currentProgress,
      recommendation: "Issue notice to contractor. Escalate to supervising officer.",
    };
  }
}

export function getMpPendingApprovals(constituencyId: string): DevelopmentIssue[] {
  return getMpPendingApprovalsRanked(constituencyId, issues());
}