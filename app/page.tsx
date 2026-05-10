import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Scanlines } from "@/components/terminal/scanlines";
import { StatusTicker } from "@/components/terminal/status-ticker";
import { Hero } from "@/components/hero";
import { SignInButton } from "@/components/sign-in-button";
import { loadAll } from "@/lib/exercises/loader";

const ERROR_MESSAGES: Record<string, string> = {
  blocked: "Accès refusé. Contacte ton prof si c'est une erreur.",
  auth_error: "Erreur d'authentification, réessaie.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const errorKey = Object.keys(ERROR_MESSAGES).find((k) => sp[k] === "1");
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const service = createServiceClient();
    const { data: student } = await service
      .from("students")
      .select("is_admin")
      .eq("email", user.email)
      .maybeSingle();
    if (student) {
      redirect(student.is_admin ? "/admin" : "/exercices");
    }
  }

  const total = loadAll().length;

  return (
    <>
      <Scanlines />
      <StatusTicker />
      <main className="relative z-[2] mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        {errorMessage && (
          <div className="mb-6 border border-terminal-err/60 bg-terminal-err/10 px-4 py-2 text-sm text-terminal-err">
            {errorMessage}
          </div>
        )}
        <Hero />
        <div className="mt-4 space-y-5">
          <p className="text-sm text-stone-400">
            {total} exercices calibrés BTS SIO SISR. Connecte-toi pour
            accéder à ton entraînement.
          </p>
          <SignInButton />
          <p className="text-[11px] text-stone-600">
            Authentification via Google. Aucun mot de passe à retenir.
          </p>
        </div>

        <section className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="border border-stone-800 bg-stone-900/30 p-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              programme
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              8 modules : bases AD, lecture (Get-AD*), modification, groupes,
              mots de passe, comptes privilégiés, GPO, audit-incident.
              Calibré sur les annales E7.
            </p>
          </div>
          <div className="border border-stone-800 bg-stone-900/30 p-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              progression
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              Indices progressifs, feedback précis. On te dit où ta
              commande diverge de l&apos;attendu.
            </p>
          </div>
          <div className="border border-stone-800 bg-stone-900/30 p-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              technique
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              AD simulé en mémoire, parser PowerShell custom. Pas de
              Windows à installer, pas de VM. Tout tourne en JS dans ton
              navigateur.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
