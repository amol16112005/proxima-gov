import { redirect } from "next/navigation";

export default function NewGrievanceRedirect() {
  redirect("/citizen/issues/new");
}