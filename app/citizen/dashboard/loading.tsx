import styles from "@/app/shared.module.css";

export default function CitizenDashboardLoading() {
  return (
    <div className={styles.pageWide} role="status" aria-live="polite" aria-busy="true">
      <p className={styles.subtitle}>Loading your citizen dashboard…</p>
    </div>
  );
}