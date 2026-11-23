import { redirect } from "next/navigation";
import { getReporter } from "@/lib/reporter";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regisztráció – TechALARM" };

export default async function RegisterPage() {
  if ((await getReporter())?.status === "approved" || (await getReporter())?.status === "pending") redirect("/");
  return (
    <>
      <h1>Regisztráció</h1>
      <p className="lead">
        Hibát csak regisztrált felhasználó jelenthet be. Add meg a neved és egy jelszót, és rögtön bejelenthetsz. Az admin jóváhagyásáig a bejelentéseid hitelesítetlenként jelennek meg.
      </p>
      <RegisterForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
    </>
  );
}
