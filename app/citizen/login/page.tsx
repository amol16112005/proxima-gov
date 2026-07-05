import Link from "next/link";
import AuthPageShell from "@/components/AuthPageShell";
import OtpAuthFlow from "@/components/OtpAuthFlow";
import { safeCitizenNextPath } from "@/lib/auth/issueAccess";
import { getSession } from "@/lib/auth/session";
import styles from "@/app/shared.module.css";

export default async function CitizenLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const { reason, next } = await searchParams;
  const redirectTo = safeCitizenNextPath(next);
  const session = await getSession();
  const activeSessionRole =
    session && session.role !== "citizen" ? session.role : undefined;

  return (
    <AuthPageShell
      portal="citizen"
      badge="Citizen Portal · OTP Secured"
      reason={reason}
      activeSessionRole={activeSessionRole}
      activeSessionName={session?.name}
    >
      <OtpAuthFlow
        role="citizen"
        purpose="login"
        title="Citizen Login"
        subtitle="Enter your registered mobile number to receive a one-time password."
        redirectTo={redirectTo ?? undefined}
        blocked={Boolean(activeSessionRole)}
        footer={
          <p style={{ fontSize: "0.88rem", color: "#7c8db5" }}>
            Don&apos;t have an account?{" "}
            <Link href="/citizen/register" style={{ color: "#a78bfa" }}>
              Register here
            </Link>
            {" · "}
            <Link href="/" className={styles.linkMuted}>
              Back to home
            </Link>
          </p>
        }
      />
    </AuthPageShell>
  );
}