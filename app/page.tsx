import HomeBottomSections from "@/components/home/HomeBottomSections";
import HomeLocalizedSections from "@/components/home/HomeLocalizedSections";
import WrongPortalNotice from "@/components/WrongPortalNotice";
import { getSession } from "@/lib/auth/session";
import styles from "@/app/page.module.css";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; active?: string }>;
}) {
  const { reason, active } = await searchParams;
  const session = await getSession();
  const activeRole =
    active === "citizen" || active === "mp"
      ? active
      : session?.role === "citizen" || session?.role === "mp"
        ? session.role
        : undefined;
  const showWrongPortal = reason === "wrong_portal" && activeRole;

  return (
    <div className={styles.page}>
      {showWrongPortal ? (
        <WrongPortalNotice
          activeRole={activeRole}
          userName={session?.name}
          targetLoginHref={activeRole === "citizen" ? "/mp/login" : "/citizen/login"}
          variant="home"
        />
      ) : null}

      <HomeLocalizedSections />
      <HomeBottomSections />
    </div>
  );
}