"use client";

import Link from "next/link";
import type { ModuleWithExercices } from "@/types/exercise";
import { computeUnlockedExos } from "@/lib/exercises/unlock";

export function ProgrammeGrid({
  modules,
  completedIds,
  isAdmin = false,
}: {
  modules: ModuleWithExercices[];
  completedIds: string[];
  isAdmin?: boolean;
}) {
  const completed = new Set(completedIds);
  const totalExos = modules.reduce((acc, m) => acc + m.exercices.length, 0);
  const unlocked = isAdmin
    ? new Set(modules.flatMap((m) => m.exercices.map((e) => e.id)))
    : computeUnlockedExos(modules, completed);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-4">
          <span className="border border-stone-700 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-stone-200">
            Programme · E7
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500 tabular-nums">
            {completed.size} / {totalExos} validés
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {modules.map((m) => (
          <section key={m.module}>
            <header className="mb-4 flex items-baseline gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
                module {m.module}
              </span>
              <h2 className="text-base text-amber">{m.titre}</h2>
              <span className="text-[11px] text-stone-600 tabular-nums">
                {m.exercices.filter((e) => completed.has(e.id)).length} /{" "}
                {m.exercices.length}
              </span>
            </header>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {m.exercices.map((e) => {
                const isCompleted = completed.has(e.id);
                const isUnl = unlocked.has(e.id);
                return (
                  <li key={e.id}>
                    {isUnl ? (
                      <Link
                        href={`/exercices/${e.id}`}
                        className="group flex items-baseline justify-between gap-3 border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-200 transition hover:border-amber hover:bg-stone-950 hover:text-amber"
                      >
                        <span className="flex items-baseline gap-2 truncate">
                          <span
                            className={`mr-1 ${isCompleted ? "text-emerald-400" : "text-stone-600"} group-hover:text-amber`}
                          >
                            {isCompleted ? "✓" : ">"}
                          </span>
                          <span className="text-stone-500 tabular-nums">
                            {m.module}.{e.ordre}
                          </span>
                          <span className="truncate">{e.titre}</span>
                        </span>
                        <span className="whitespace-nowrap text-[10px] uppercase text-stone-500">
                          {e.difficulte}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-baseline justify-between gap-3 border border-stone-800 bg-stone-900/30 px-4 py-3 text-sm text-stone-600">
                        <span className="flex items-baseline gap-2 truncate">
                          <span className="mr-1">🔒</span>
                          <span className="tabular-nums">
                            {m.module}.{e.ordre}
                          </span>
                          <span className="truncate">{e.titre}</span>
                        </span>
                        <span className="whitespace-nowrap text-[10px] uppercase">
                          verrouillé
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
