import AuthPageShell from "@/components/AuthPageShell";
import OtpAuthFlow from "@/components/OtpAuthFlow";
import { safeCitizenNextPath } from "@/lib/auth/issueAccess";
import { getSession } from "@/lib/auth/session";

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
      badgeKey="auth.citizenBadge"
      reason={reason}
      activeSessionRole={activeSessionRole}
      activeSessionName={session?.name}
    >
      <OtpAuthFlow
        role="citizen"
        purpose="login"
        redirectTo={redirectTo ?? undefined}
        blocked={Boolean(activeSessionRole)}
      />
    </AuthPageShell>
  );
}