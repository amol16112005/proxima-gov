"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import ls from "./lifecycle.module.css";

export default function CitizenVerify({ issueId }: { issueId: string }) {
  const router = useRouter();
  const { translate: t } = useAccessibility();
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
        setError(data.error ?? t("verify.failed"));
        return;
      }
      setVote(v);
      setDone(true);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={ls.panel}>
        <p style={{ color: vote === "yes" ? "#34d399" : "#fca5a5", fontWeight: 600 }}>
          {interpolate(t("verify.thankYou"), {
            vote: vote === "yes" ? t("verify.yesVote") : t("verify.noVote"),
          })}
        </p>
        <p style={{ fontSize: "0.85rem", color: "#9aa5b8", marginTop: "0.5rem" }}>
          {t("verify.mpReviewNote")}
        </p>
      </div>
    );
  }

  return (
    <section className={ls.panel}>
      <h3 className={ls.panelTitle}>{t("verify.title")}</h3>
      <p style={{ fontSize: "0.9rem", color: "#9aa5b8", marginBottom: "0.5rem" }}>{t("verify.prompt")}</p>
      {error && (
        <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.75rem" }} role="alert">
          {error}
        </p>
      )}
      <div className={ls.verifyButtons}>
        <button className={ls.verifyYes} onClick={() => submit("yes")} disabled={loading} type="button">
          {t("verify.yesBtn")}
        </button>
        <button className={ls.verifyNo} onClick={() => submit("no")} disabled={loading} type="button">
          {t("verify.noBtn")}
        </button>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#5a6880", marginTop: "0.75rem" }}>{t("verify.hint")}</p>
    </section>
  );
}