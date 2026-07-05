import { redirect } from "next/navigation";

export default function GrievancesRedirect() {
  redirect("/citizen/issues");
}