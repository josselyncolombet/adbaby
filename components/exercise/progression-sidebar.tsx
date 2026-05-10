"use client";

import Link from "next/link";
import type { ModuleWithExercices } from "@/types/exercise";
import {
  computeUnlockedExos,
  computeUnlockedCourses,
} from "@/lib/exercises/unlock";

interface Props {
  modules: ModuleWithExercices[];
  completedIds: string[];
  currentId?: string;
  currentCourseId?: number;
  isAdmin?: boolean;
}

export function ProgressionSidebar({
  modules,
  completedIds,
  currentId,
  currentCourseId,
  isAdmin = false,
}: Props) {
  const validatedIds = new Set(completedIds);
  const totalAll = modules.reduce((acc, m) => acc + m.exercices.length, 0);
  const totalDone = validatedIds.size;
  const unlockedExos = isAdmin
    ? new Set(modules.flatMap((m) => m.exercices.map((e) => e.id)))
    : computeUnlockedExos(modules, validatedIds);
  const unlockedCours = isAdmin
    ? new Set(modules.map((m) => m.module))
    : computeUnlockedCourses(modules, validatedIds);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-stone-800 bg-[#0c0c0c]">
      <div className="flex items-baseline justify-between border-b border-stone-800 px-4 py-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500">
          progression
        </span>
        <span className="text-[10px] tabular-nums text-stone-400">
          {totalDone}/{totalAll}
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {modules.map((m) => {
          const isCurrentCourse = currentCourseId === m.module;
          const coursUnlocked = unlockedCours.has(m.module);
          return (
            <div key={m.module} className="mb-4 last:mb-2">
              <p className="px-4 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-600">
                {m.module} · {m.titre}
              </p>
              <ul>
                <li>
                  {coursUnlocked ? (
                    <Link
                      href={`/cours/${m.module}`}
                      className={`flex items-baseline gap-2 px-4 py-1 text-xs transition ${
                        isCurrentCourse
                          ? "bg-stone-800/60 text-amber"
                          : "text-stone-400 hover:bg-stone-800/40 hover:text-amber"
                      }`}
                    >
                      <span className="w-3 shrink-0 text-center">📖</span>
                      <span className="w-8 shrink-0 text-stone-600 tabular-nums">
                        {m.module}.0
                      </span>
                      <span>cours</span>
                    </Link>
                  ) : (
                    <span className="flex items-baseline gap-2 px-4 py-1 text-xs text-stone-700">
                      <span className="w-3 shrink-0 text-center">🔒</span>
                      <span className="w-8 shrink-0 tabular-nums">
                        {m.module}.0
                      </span>
                      <span>cours</span>
                    </span>
                  )}
                </li>
                {m.exercices.map((e) => {
                  const isCurrent = e.id === currentId;
                  const isValide = validatedIds.has(e.id);
                  const isUnl = unlockedExos.has(e.id);

                  let cls = "flex items-baseline gap-2 px-4 py-1 text-xs transition";
                  if (isCurrent) cls += " bg-stone-800/60 text-amber";
                  else if (isValide) cls += " text-emerald-400/80";
                  else if (isUnl) cls += " text-stone-300";
                  else cls += " text-stone-700";

                  const dot = isValide
                    ? "●"
                    : isCurrent
                      ? "▶"
                      : isUnl
                        ? "○"
                        : "🔒";

                  const inner = (
                    <>
                      <span className="w-3 shrink-0 text-center tabular-nums">
                        {dot}
                      </span>
                      <span className="w-8 shrink-0 text-stone-600 tabular-nums">
                        {m.module}.{e.ordre}
                      </span>
                      <span className="truncate">{e.titre}</span>
                    </>
                  );

                  return (
                    <li key={e.id}>
                      {isUnl ? (
                        <Link
                          href={`/exercices/${e.id}`}
                          className={`${cls} hover:bg-stone-800/40 hover:text-amber`}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <span className={cls}>{inner}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
