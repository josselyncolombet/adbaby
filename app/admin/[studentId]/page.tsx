import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Scanlines } from "@/components/terminal/scanlines";
import { StatusTicker } from "@/components/terminal/status-ticker";
import { SignOutButton } from "@/components/sign-out-button";
import { getModules } from "@/lib/exercises/modules";
import { computeUnlockedExos } from "@/lib/exercises/unlock";
import {
  setStudentBlocked,
  markExerciseCompleted,
  unmarkExercise,
  resetStudentProgress,
} from "./actions";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

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

  const { data: student } = await service
    .from("students")
    .select("id, email, full_name, is_blocked, created_at")
    .eq("id", studentId)
    .maybeSingle();
  if (!student) notFound();

  const modules = getModules();
  const { data: completionsRows } = await service
    .from("completions")
    .select("exercise_id, completed_at, attempts_count")
    .eq("student_id", student.id);

  const completed = new Map(
    (completionsRows ?? []).map((r) => [r.exercise_id as string, r]),
  );
  const completedSet = new Set(completed.keys());
  const unlocked = computeUnlockedExos(modules, completedSet);

  return (
    <>
      <Scanlines />
      <StatusTicker
        right={
          <>
            <Link
              href="/admin"
              className="text-xs uppercase tracking-wider text-stone-500 transition hover:text-amber"
            >
              roster
            </Link>
            <SignOutButton />
          </>
        }
      />
      <main className="relative z-[2] mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs uppercase tracking-wider text-stone-500 transition hover:text-amber"
            >
              ◀ retour
            </Link>
            <span className="text-base text-amber">{student.full_name}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
              {student.email}
            </span>
            {student.is_blocked && (
              <span className="border border-terminal-err/60 px-2 py-0.5 text-[10px] uppercase text-terminal-err">
                bloqué
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-stone-500 tabular-nums">
            <span>{completed.size} validés</span>
            <form
              action={async () => {
                "use server";
                await setStudentBlocked(student.id, !student.is_blocked);
              }}
            >
              <button
                className={`border px-2 py-0.5 text-[10px] uppercase transition ${
                  student.is_blocked
                    ? "border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-terminal-err/60 text-terminal-err hover:bg-terminal-err/10"
                }`}
              >
                {student.is_blocked ? "débloquer" : "bloquer"}
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await resetStudentProgress(student.id);
              }}
            >
              <button className="border border-stone-700 px-2 py-0.5 text-[10px] uppercase text-stone-400 transition hover:border-amber hover:text-amber">
                reset progression
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {modules.map((m) => (
            <section key={m.module}>
              <header className="mb-3 flex items-baseline gap-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
                  module {m.module}
                </span>
                <h2 className="text-base text-amber">{m.titre}</h2>
                <span className="text-[11px] text-stone-600 tabular-nums">
                  {m.exercices.filter((e) => completed.has(e.id)).length} /{" "}
                  {m.exercices.length}
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {m.exercices.map((e) => {
                  const c = completed.get(e.id);
                  const isUnl = unlocked.has(e.id);
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-2 border border-stone-800 bg-stone-900/30 px-3 py-2 text-xs"
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span
                          className={`w-3 ${
                            c
                              ? "text-emerald-400"
                              : isUnl
                                ? "text-stone-300"
                                : "text-stone-700"
                          }`}
                        >
                          {c ? "●" : isUnl ? "○" : "🔒"}
                        </span>
                        <span className="text-stone-500 tabular-nums">
                          {m.module}.{e.ordre}
                        </span>
                        <span className="truncate text-stone-300">{e.titre}</span>
                        {c && (
                          <span className="ml-2 text-[10px] text-stone-600 tabular-nums">
                            {c.attempts_count}t
                          </span>
                        )}
                      </span>
                      {c ? (
                        <form
                          action={async () => {
                            "use server";
                            await unmarkExercise(student.id, e.id);
                          }}
                        >
                          <button className="border border-stone-700 px-2 py-0.5 text-[10px] uppercase text-stone-400 transition hover:border-terminal-err hover:text-terminal-err">
                            invalider
                          </button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await markExerciseCompleted(student.id, e.id);
                          }}
                        >
                          <button className="border border-stone-700 px-2 py-0.5 text-[10px] uppercase text-stone-400 transition hover:border-amber hover:text-amber">
                            valider
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
