import type { LifecycleStage, ProgressSubStage } from "@/data/lifecycleTypes";
import { t, type Locale } from "./index";
import type { MessageKey } from "./types";

const STAGE_KEYS: Record<LifecycleStage, MessageKey> = {
  submitted: "stage.submitted",
  "ai-analysis": "stage.ai-analysis",
  declined: "stage.declined",
  "mp-approval": "stage.mp-approval",
  approved: "stage.approved",
  "work-assigned": "stage.work-assigned",
  "tender-released": "stage.tender-released",
  "work-started": "stage.work-started",
  "in-progress": "stage.in-progress",
  "citizen-verification": "stage.citizen-verification",
  "mp-review": "stage.mp-review",
  completed: "stage.completed",
  "impact-analysis": "stage.impact-analysis",
};

const SUB_STAGE_KEYS: Record<ProgressSubStage, MessageKey> = {
  planning: "substage.planning",
  "material-procurement": "substage.material-procurement",
  construction: "substage.construction",
  "quality-inspection": "substage.quality-inspection",
  completed: "substage.completed",
};

const CATEGORY_KEYS: Record<string, MessageKey> = {
  infrastructure: "cat.infrastructure",
  healthcare: "cat.healthcare",
  education: "cat.education",
  "water-sanitation": "cat.water-sanitation",
  employment: "cat.employment",
  safety: "cat.safety",
  other: "cat.other",
};

export function stageLabel(locale: Locale, stage: LifecycleStage): string {
  return t(locale, STAGE_KEYS[stage]);
}

export function subStageLabel(locale: Locale, sub: ProgressSubStage): string {
  return t(locale, SUB_STAGE_KEYS[sub]);
}

export function categoryLabel(locale: Locale, category: string): string {
  const key = CATEGORY_KEYS[category];
  return key ? t(locale, key) : category;
}