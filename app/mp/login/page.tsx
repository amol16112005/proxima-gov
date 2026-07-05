import AuthPageShell from "@/components/AuthPageShell";
import MpPinLogin from "@/components/MpPinLogin";
import { safeMpNextPath } from "@/lib/auth/issueAccess";
import { getSession } from "@/lib/auth/session";

export default async function MpLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const { reason, next } = await searchParams;
  const redirectTo = safeMpNextPath(next);
  const session = await getSession();
  const activeSessionRole =
    session && session.role !== "mp" ? session.role : undefined;

  return (
    <AuthPageShell
      portal="mp"
      badge="MP Portal · Restricted Access · Username + PIN"
      badgeVariant="mp"
      reason={reason}
      activeSessionRole={activeSessionRole}
      activeSessionName={session?.name}
    >
      <MpPinLogin redirectTo={redirectTo ?? undefined} blocked={Boolean(activeSessionRole)} />
    </AuthPageShell>
  );
}