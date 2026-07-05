'use client';

// ─────────────────────────────────────────────────────────────────────────────
// context/ProjectContext.tsx
// Global React state management for the Proxima Gov platform.
//
// Usage:
//   - Wrap your app with <ProjectProvider> in app/layout.tsx
//   - Consume state in any Client Component via the useProject() hook
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  dataGovBaseline,
  type GovBaseline,
  type Milestone,
  type MilestoneStatus,
} from '@/data/dataGovBaseline';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CitizenSubmission {
  id: string;
  submittedAt: string; // ISO timestamp
  aiAcknowledgment?: string; // optional AI-generated response
  fields: Record<string, string>;
}

interface ProjectState {
  /** The loaded government project baseline configuration */
  baseline: GovBaseline;
  /** All citizen submissions made during this session */
  submissions: CitizenSubmission[];
  /** Whether an AI request is in-flight */
  isAiLoading: boolean;
}

interface ProjectActions {
  /** Append a new citizen submission */
  addSubmission: (fields: Record<string, string>, aiAcknowledgment?: string) => void;
  /** Update the status of a milestone by its ID */
  updateMilestone: (milestoneId: string, status: MilestoneStatus) => void;
  /** Set the AI loading state */
  setAiLoading: (loading: boolean) => void;
}

type ProjectContextValue = ProjectState & ProjectActions;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ProjectContext = createContext<ProjectContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ProjectProviderProps {
  children: React.ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [baseline, setBaseline] = useState<GovBaseline>(dataGovBaseline);
  const [submissions, setSubmissions] = useState<CitizenSubmission[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  /** Append a new citizen submission to the list */
  const addSubmission = useCallback(
    (fields: Record<string, string>, aiAcknowledgment?: string) => {
      const newSubmission: CitizenSubmission = {
        id: `SUB-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        aiAcknowledgment,
        fields,
      };
      setSubmissions((prev) => [...prev, newSubmission]);
    },
    []
  );

  /** Update the status of a milestone by ID */
  const updateMilestone = useCallback(
    (milestoneId: string, status: MilestoneStatus) => {
      setBaseline((prev) => ({
        ...prev,
        milestones: prev.milestones.map((ms: Milestone) =>
          ms.id === milestoneId ? { ...ms, status } : ms
        ),
      }));
    },
    []
  );

  /** Expose the AI loading toggle */
  const setAiLoading = useCallback((loading: boolean) => {
    setIsAiLoading(loading);
  }, []);

  const value = useMemo<ProjectContextValue>(
    () => ({
      baseline,
      submissions,
      isAiLoading,
      addSubmission,
      updateMilestone,
      setAiLoading,
    }),
    [baseline, submissions, isAiLoading, addSubmission, updateMilestone, setAiLoading]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * useProject — consume the ProjectContext.
 * Must be called inside a component rendered within <ProjectProvider>.
 */
export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error(
      'useProject must be used within a <ProjectProvider>. ' +
        'Make sure your app/layout.tsx wraps children with <ProjectProvider>.'
    );
  }
  return ctx;
}
