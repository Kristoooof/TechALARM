import LoginForm from "./LoginForm";

export const metadata = { title: "Admin belépés – TechALARM" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ hiba?: string }> }) {
  const { hiba } = await searchParams;
  return (
    <>
      <h1>Admin belépés</h1>
      {hiba === "jogosultsag" && <div className="alert error">Ehhez a fiókhoz nincs admin jogosultság.</div>}
      <LoginForm />
    </>
  );
}
