import { Scanlines } from "@/components/terminal/scanlines";
import { StatusTicker } from "@/components/terminal/status-ticker";
import { SignOutButton } from "@/components/sign-out-button";
import { ProgrammeGrid } from "@/components/exercise/programme-grid";
import { getModules } from "@/lib/exercises/modules";
import { requireStudent } from "@/lib/auth/require-student";
import { getCompletedExoIds } from "@/lib/progression/completions";

export default async function ExercicesHub({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const lockedExo = sp.locked ?? null;

  const student = await requireStudent();
  const modules = getModules();
  const completed = await getCompletedExoIds(student.id);

  return (
    <>
      <Scanlines />
      <StatusTicker
        right={
          <>
            <span className="hidden text-xs uppercase tracking-wider text-stone-500 sm:inline">
              {student.full_name}
              {student.is_admin && <span className="ml-2 text-amber">·admin</span>}
            </span>
            <SignOutButton />
          </>
        }
      />
      <main className="relative z-[2] mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        {lockedExo && (
          <div className="mb-6 border border-terminal-warn/60 bg-terminal-warn/10 px-4 py-2 text-sm text-terminal-warn">
            cet exercice est verrouillé. termine d&apos;abord les précédents.
          </div>
        )}
        <ProgrammeGrid
          modules={modules}
          completedIds={[...completed]}
          isAdmin={student.is_admin}
        />
      </main>
    </>
  );
}
