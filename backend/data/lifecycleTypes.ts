export type LifecycleStage =
  | "submitted"
  | "ai-analysis"
  | "declined"
  | "mp-approval"
  | "approved"
  | "work-assigned"
  | "tender-released"
  | "work-started"
  | "in-progress"
  | "citizen-verification"
  | "mp-review"
  | "completed"
  | "impact-analysis";

export type ProgressSubStage =
  | "planning"
  | "material-procurement"
  | "construction"
  | "quality-inspection"
  | "completed";

export type ScopeVerdict =
  | "eligible"
  | "out-of-constituency"
  | "wrong-authority"
  | "not-mp-mandate";

export interface AiAnalysis {
  priorityScore: number;
  similarComplaints: number;
  populationAffected: string;
  schoolNearby: boolean;
  hospitalConnectivity: boolean;
  estimatedCost: number;
  reasons: string[];
  recommendation: string;
  analyzedAt: string;
  /** Whether the issue is within the MP's constituency development mandate. */
  mpEligible?: boolean;
  scopeVerdict?: ScopeVerdict;
  citizenGuidance?: string;
  suggestedAuthority?: string;
  triageReasons?: string[];
  /** AI-extracted theme for demand clustering (e.g. water-infrastructure, education). */
  themeCategory?: string;
  /** Village, ward, or neighbourhood hotspot extracted from citizen text. */
  geographicHotspot?: string;
  /** Urgency from critical keywords (0–100). */
  urgencyScore?: number;
  /** Flat boost added to composite score: +20 life-safety, +15 high urgency, +0 routine. */
  urgencyBoost?: number;
  /** Structural weight from demographics + public datasets (0–100). */
  infrastructureGapWeight?: number;
  /** Citizens in the same theme+hotspot cluster. */
  citizenDemandCount?: number;
  /** Cluster key for grouped recommendations. */
  clusterId?: string;
  /** Ranked score: (Demand×0.4) + (Data Gap×0.6) + urgency boost. */
  compositePriorityScore?: number;
  /** Public dataset signals used in gap weighting. */
  dataSignals?: string[];
  /** True when the citizen attached an optional submission photo. */
  hasPhotoEvidence?: boolean;
  /** Small flat boost (+5) when optional citizen photo is attached. */
  photoEvidenceBoost?: number;
}

export interface MpApproval {
  approved: boolean;
  fund: string;
  budget: number;
  approvalDate: string;
  mpName: string;
}

export interface WorkAssignment {
  contractor: string;
  officer: string;
  estimatedDays: number;
  assignedAt: string;
}

export interface BudgetTracking {
  total: number;
  spent: number;
  deadline: string;
}

export interface TimelineEvent {
  date: string;
  label: string;
  stage: LifecycleStage;
}

export interface ProgressImage {
  week: number;
  label: string;
  caption: string;
  gps: { lat: number; lng: number };
  capturedAt: string;
  verified: boolean;
  /** Base64 data URL or public path for the uploaded site photo. */
  imageUrl?: string;
  /** True when this is the mandatory completion / after-work site photo. */
  isCompletion?: boolean;
}

export type MpReviewDecision =
  | "approve-closure"
  | "reopen-contractor"
  | "escalate-officer"
  | "reject-reinspect";

export interface AccountabilityRecord {
  party: "contractor" | "officer";
  action: string;
  note: string;
  mpName: string;
  at: string;
}

export interface MpReviewState {
  citizenVerdict: "approved" | "rejected" | "mixed";
  citizenFeedbackAt: string;
  yesVotes: number;
  noVotes: number;
  accountability: AccountabilityRecord[];
}

export interface CitizenVerification {
  yesVotes: number;
  noVotes: number;
  flagged: boolean;
  responses: { citizenId: string; vote: "yes" | "no"; photoUrl?: string; at: string }[];
}

export interface ImpactMetrics {
  period: string;
  before: { complaints: number; travelTimeMin: number; schoolAttendance: number; ambulanceDelayMin: number };
  after: { complaints: number; travelTimeMin: number; schoolAttendance: number; ambulanceDelayMin: number };
  summary: string;
}

export interface DelayAlert {
  active: boolean;
  reason: string;
  daysStalled: number;
  expectedCompletion: string;
  currentCompletion: number;
  recommendation: string;
}

export interface DevelopmentIssue {
  id: string;
  citizenId?: string;
  citizenName: string;
  constituencyId: string;
  category: string;
  title: string;
  description: string;
  location: string;
  submittedAt: string;
  stage: LifecycleStage;
  currentProgress: number;
  progressSubStage: ProgressSubStage;
  aiAnalysis?: AiAnalysis;
  approval?: MpApproval;
  workAssignment?: WorkAssignment;
  budget?: BudgetTracking;
  timeline: TimelineEvent[];
  progressImages: ProgressImage[];
  verification?: CitizenVerification;
  mpReview?: MpReviewState;
  impactAnalysis?: ImpactMetrics;
  delayAlert?: DelayAlert;
  beforeImageLabel: string;
  afterImageLabel?: string;
  /** Optional citizen-submitted photo at issue filing (compressed data URL). */
  submissionPhotoUrl?: string;
}

export const STAGE_LABELS: Record<LifecycleStage, string> = {
  submitted: "Submitted",
  "ai-analysis": "AI Analysis",
  declined: "Not Taken Up — Referred Elsewhere",
  "mp-approval": "Awaiting MP Approval",
  approved: "Approved",
  "work-assigned": "Work Assigned",
  "tender-released": "Tender Released",
  "work-started": "Work Started",
  "in-progress": "In Progress",
  "citizen-verification": "Citizen Verification",
  "mp-review": "MP Review & Accountability",
  completed: "Completed",
  "impact-analysis": "Impact Analysis",
};

export const STAGE_EMOJI: Record<LifecycleStage, string> = {
  submitted: "🟡",
  "ai-analysis": "🤖",
  declined: "🚫",
  "mp-approval": "⏳",
  approved: "🟢",
  "work-assigned": "👷",
  "tender-released": "📋",
  "work-started": "🚧",
  "in-progress": "🔄",
  "citizen-verification": "✋",
  "mp-review": "🏛️",
  completed: "✅",
  "impact-analysis": "📊",
};

export const SUB_STAGE_CONFIG: { key: ProgressSubStage; label: string; progress: number }[] = [
  { key: "planning", label: "Planning", progress: 20 },
  { key: "material-procurement", label: "Material Procurement", progress: 40 },
  { key: "construction", label: "Construction", progress: 65 },
  { key: "quality-inspection", label: "Quality Inspection", progress: 90 },
  { key: "completed", label: "Completed", progress: 100 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  infrastructure: "Infrastructure & Roads",
  healthcare: "Healthcare",
  education: "Education",
  "water-sanitation": "Water & Sanitation",
  employment: "Employment & Welfare",
  safety: "Public Safety",
  other: "Other",
};