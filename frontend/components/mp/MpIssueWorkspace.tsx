"use client";

import { useEffect, useState } from "react";
import LifecycleTracker from "@/components/lifecycle/LifecycleTracker";
import MpIssueActions from "@/components/lifecycle/MpIssueActions";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";

interface MpIssueWorkspaceProps {
  issue: DevelopmentIssue;
}

export default function MpIssueWorkspace({ issue: serverIssue }: MpIssueWorkspaceProps) {
  const [issue, setIssue] = useState(serverIssue);

  useEffect(() => {
    setIssue(serverIssue);
  }, [serverIssue]);

  return (
    <>
      <MpIssueActions issue={issue} onIssueUpdated={setIssue} />
      <LifecycleTracker issue={issue} />
    </>
  );
}