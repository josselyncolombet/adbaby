import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Scanlines } from "@/components/terminal/scanlines";
import { StatusTicker } from "@/components/terminal/status-ticker";
import { SignOutButton } from "@/components/sign-out-button";
import { ProgressionSidebar } from "@/components/exercise/progression-sidebar";
import { CourseContent } from "@/components/exercise/course-content";
import { loadCourse } from "@/lib/courses/loader";
import { getModules, MODULES } from "@/lib/exercises/modules";
import { computeUnlockedCourses } from "@/lib/exercises/unlock";
import { requireStudent } from "@/lib/auth/require-student";
import { getCompletedExoIds } from "@/lib/progression/completions";

export function generateStaticParams() {
  return MODULES.map((m) => ({ moduleId: String(m.module) }));
}

export default async function CoursPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const idNum = Number(moduleId);
  if (!Number.isFinite(idNum)) notFound();
  const md = loadCourse(idNum);
  if (!md) notFound();
  const moduleInfo = MODULES.find((m) => m.module === idNum);
  const modules = getModules();

  const student = await requireStudent();
  const completed = await getCompletedExoIds(student.id);

  if (!student.is_admin) {
    const unlocked = computeUnlockedCourses(modules, completed);
    if (!unlocked.has(idNum)) {
      redirect(`/exercices?locked=cours-${idNum}`);
    }
  }

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
        <div className="flex flex-col md:h-[calc(100vh-2.75rem)] md:min-h-[600px] md:flex-row">
          <div className="hidden lg:flex">
            <ProgressionSidebar
              modules={modules}
              completedIds={[...completed]}
              currentCourseId={idNum}
              isAdmin={student.is_admin}
            />
          </div>
          <section className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
              cours · module {idNum}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-amber md:text-3xl">
              {moduleInfo?.titre}
            </h1>
            <article className="mt-6">
              <CourseContent body={md} />
            </article>
          </section>
        </div>
      </main>
    </>
  );
}
