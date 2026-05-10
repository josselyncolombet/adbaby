import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Scanlines } from "@/components/terminal/scanlines";
import { StatusTicker } from "@/components/terminal/status-ticker";
import { SignOutButton } from "@/components/sign-out-button";
import { loadAll } from "@/lib/exercises/loader";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/");

  const service = createServiceClient();
  const { data: me } = await service
    .from("students")
    .select("is_admin")
    .eq("email", user.email)
    .maybeSingle();
  if (!me?.is_admin) redirect("/exercices");

  const { data: students } = await service
    .from("students")
    .select("id, email, full_name, is_admin, is_blocked, created_at")
    .order("full_name");

  const ids = (students ?? []).map((s) => s.id);
  const placeholderId = "00000000-0000-0000-0000-000000000000";
  const { data: completions } = await service
    .from("completions")
    .select("student_id, exercise_id, completed_at")
    .in("student_id", ids.length ? ids : [placeholderId]);

  const totalExos = loadAll().length;
  const counter = new Map<string, { count: number; lastAt: string | null }>();
  for (const c of completions ?? []) {
    const cur = counter.get(c.student_id) ?? { count: 0, lastAt: null };
    cur.count++;
    if (!cur.lastAt || c.completed_at > cur.lastAt) cur.lastAt = c.completed_at;
    counter.set(c.student_id, cur);
  }

  const nonAdmin = (students ?? []).filter((s) => !s.is_admin);

  return (
    <>
      <Scanlines />
      <StatusTicker
        right={
          <>
            <Link
              href="/exercices"
              className="text-xs uppercase tracking-wider text-stone-500 transition hover:text-amber"
            >
              vue élève
            </Link>
            <SignOutButton />
          </>
        }
      />
      <main className="relative z-[2] mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-4">
            <span className="border border-amber/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-amber">
              Admin · roster
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500 tabular-nums">
              {nonAdmin.length} étudiant{nonAdmin.length > 1 ? "s" : ""} ·{" "}
              {totalExos} exos au programme
            </span>
          </div>
        </div>

        {nonAdmin.length === 0 ? (
          <p className="mt-8 border border-stone-800 bg-stone-900/30 p-6 text-sm text-stone-400">
            Aucun étudiant inscrit pour l&apos;instant. Ils apparaîtront ici dès
            leur première connexion Google.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {nonAdmin.map((s) => {
              const stat = counter.get(s.id) ?? { count: 0, lastAt: null };
              const lastAt = stat.lastAt
                ? new Date(stat.lastAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })
                : "—";
              return (
                <li key={s.id}>
                  <Link
                    href={`/admin/${s.id}`}
                    className={`group flex items-baseline justify-between gap-3 border px-4 py-3 text-sm transition ${
                      s.is_blocked
                        ? "border-terminal-err/40 bg-stone-900/40 text-stone-600 hover:border-terminal-err"
                        : "border-stone-700 bg-stone-900 text-stone-200 hover:border-amber hover:bg-stone-950 hover:text-amber"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <span className="mr-2 text-stone-600 group-hover:text-amber">
                        &gt;
                      </span>
                      {s.full_name}
                      {s.is_blocked && (
                        <span className="ml-2 text-[10px] uppercase text-terminal-err">
                          bloqué
                        </span>
                      )}
                      <span className="ml-2 text-[10px] text-stone-600">
                        {s.email}
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-[10px] uppercase text-stone-500 tabular-nums">
                      {stat.count}/{totalExos} · {lastAt}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
