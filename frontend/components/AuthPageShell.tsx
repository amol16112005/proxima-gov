import Link from "next/link";
import WrongPortalNotice from "@/components/WrongPortalNotice";
import styles from "@/app/shared.module.css";

type AuthPortal = "citizen" | "mp";

const NOTICES: Record<string, string> = {
  session_required: "Please sign in to continue. Your session may have expired.",
};

interface AuthPageShellProps {
  portal: AuthPortal;
  badge: string;
  badgeVariant?: "citizen" | "mp";
  reason?: string;
  activeSessionRole?: "citizen" | "mp";
  activeSessionName?: string;
  children: React.ReactNode;
}

export default function AuthPageShell({
  portal,
  badge,
  badgeVariant = portal,
  reason,
  activeSessionRole,
  activeSessionName,
  children,
}: AuthPageShellProps) {
  const notice = reason ? NOTICES[reason] : null;
  const wrongPortal =
    activeSessionRole && activeSessionRole !== portal
      ? { activeRole: activeSessionRole, targetLoginHref: portal === "mp" ? "/mp/login" : "/citizen/login" }
      : null;
  const otherLabel = portal === "citizen" ? "MP Portal" : "Citizen Portal";
  const otherHref = portal === "citizen" ? "/mp/login" : "/citizen/login";

  return (
    <main className={styles.page}>
      <nav className={styles.authNav} aria-label="Portal navigation">
        <Link href="/" className={styles.linkMuted}>
          ← Home
        </Link>
        <div className={styles.authNavLinks}>
          <Link href={otherHref} className={styles.linkMuted}>
            {otherLabel}
          </Link>
          {portal === "citizen" && (
            <Link href="/citizen/register" className={styles.linkMuted}>
              Register
            </Link>
          )}
          <Link href="/faq" className={styles.linkMuted}>
            FAQs
          </Link>
          <Link href="/transparency" className={styles.linkMuted}>
            Transparency
          </Link>
        </div>
      </nav>

      <div className={badgeVariant === "mp" ? styles.badgeMp : styles.badge}>{badge}</div>

      {wrongPortal ? (
        <WrongPortalNotice
          activeRole={wrongPortal.activeRole}
          userName={activeSessionName}
          targetLoginHref={wrongPortal.targetLoginHref}
        />
      ) : notice ? (
        <p className={styles.authNotice} role="status">
          {notice}
        </p>
      ) : null}

      {children}
    </main>
  );
}