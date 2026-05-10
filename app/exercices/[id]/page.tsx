import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Scanlines } from "@/components/terminal/scanlines";
import { StatusTicker } from "@/components/terminal/status-ticker";
import { SignOutButton } from "@/components/sign-out-button";
import { loadAll, loadById, loadSnapshot } from "@/lib/exercises/loader";
import { getModules } from "@/lib/exercises/modules";
import { computeUnlockedExos } from "@/lib/exercises/unlock";
import { requireStudent } from "@/lib/auth/require-student";
import { getCompletedExoIds } from "@/lib/progression/completions";
import { ExerciseWorkspace } from "./exercise-workspace";

export function generateStaticParams() {
  return loadAll().map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exercise = loadById(id);
  if (!exercise) return { title: "Exercice introuvable" };
  return { title: exercise.titre, description: exercise.enonce };
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = loadById(id);
  if (!exercise) notFound();

  const student = await requireStudent();
  const modules = getModules();
  const completed = await getCompletedExoIds(student.id);

  // Gate côté serveur : non-admin doit avoir débloqué l'exo
  if (!student.is_admin) {
    const unlocked = computeUnlockedExos(modules, completed);
    if (!unlocked.has(id)) {
      redirect(`/exercices?locked=${encodeURIComponent(id)}`);
    }
  }

  const snapshot = exercise.donnees.snapshot
    ? loadSnapshot(exercise.donnees.snapshot)
    : null;

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
              programme
            </Link>
            <span className="hidden text-xs uppercase tracking-wider text-stone-500 sm:inline">
              {student.full_name}
              {student.is_admin && <span className="ml-2 text-amber">·admin</span>}
            </span>
            <SignOutButton />
          </>
        }
      />
      <main className="relative z-[2]">
        <ExerciseWorkspace
          exercise={exercise}
          modules={modules}
          completedIds={[...completed]}
          isAdmin={student.is_admin}
          snapshot={snapshot}
        />
      </main>
    </>
  );
}
