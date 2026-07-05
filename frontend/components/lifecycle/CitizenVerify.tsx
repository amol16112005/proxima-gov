"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ls from "./lifecycle.module.css";

export default function CitizenVerify({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (v: "yes" | "no") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: v }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      setVote(v);
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={ls.panel}>
        <p style={{ color: vote === "yes" ? "#34d399" : "#fca5a5", fontWeight: 600 }}>
          Thank you! Your verification ({vote === "yes" ? "👍 Yes" : "👎 No"}) has been recorded.
        </p>
        <p style={{ fontSize: "0.85rem", color: "#9aa5b8", marginTop: "0.5rem" }}>
          Your MP will now review the project, examine the photos, and take action against the
          contractor or officer if the work is unsatisfactory.
        </p>
      </div>
    );
  }

  return (
    <section className={ls.panel}>
      <h3 className={ls.panelTitle}>✋ Stage 6: Citizen Verification</h3>
      <p style={{ fontSize: "0.9rem", color: "#9aa5b8", marginBottom: "0.5rem" }}>
        The contractor has marked this work complete. Review the progress photos above — is the
        work actually finished to a satisfactory standard?
      </p>
      {error && (
        <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.75rem" }} role="alert">
          {error}
        </p>
      )}
      <div className={ls.verifyButtons}>
        <button className={ls.verifyYes} onClick={() => submit("yes")} disabled={loading} type="button">
          👍 Yes, verified
        </button>
        <button className={ls.verifyNo} onClick={() => submit("no")} disabled={loading} type="button">
          👎 No, not satisfactory
        </button>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#5a6880", marginTop: "0.75rem" }}>
        Your feedback is sent to your MP for accountability review — the project will not close
        until the MP takes action.
      </p>
    </section>
  );
}