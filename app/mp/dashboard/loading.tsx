import styles from "@/app/shared.module.css";

export default function MpDashboardLoading() {
  return (
    <div className={styles.pageWide} role="status" aria-live="polite" aria-busy="true">
      <p className={styles.subtitle}>Loading MP dashboard…</p>
    </div>
  );
}