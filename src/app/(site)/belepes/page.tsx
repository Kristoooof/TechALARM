import { redirect } from "next/navigation";
import { getReporter } from "@/lib/reporter";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Belépés – TechALARM" };

export default async function LoginPage() {
  const current = await getReporter();
  if (current && current.status !== "rejected") redirect("/");
  return (
    <>
      <h1>Belépés</h1>
      <p className="lead">Lépj be a neveddel és a jelszavaddal, hogy bejelentést tudj tenni.</p>
      <LoginForm />
    </>
  );
}
