import type { ModuleWithExercices } from "@/types/exercise";

/**
 * Règle de déblocage stricte (mêmes règles que subnetbaby) :
 * - Le 1er exo du 1er module est toujours débloqué.
 * - L'exo N est débloqué ssi l'exo N-1 du même module est validé.
 * - Le 1er exo d'un module est débloqué ssi tout le module précédent est validé.
 * - Le cours d'un module est débloqué ssi tout le module précédent est validé
 *   (le cours du module 1 est toujours libre).
 */
export function computeUnlockedExos(
  modules: ModuleWithExercices[],
  completed: Set<string>,
): Set<string> {
  const unlocked = new Set<string>();
  let prevModuleAllDone = true;

  for (const m of modules) {
    let prevExoDone = prevModuleAllDone;
    for (const e of m.exercices) {
      if (prevExoDone) unlocked.add(e.id);
      prevExoDone = prevExoDone && completed.has(e.id);
    }
    prevModuleAllDone =
      prevModuleAllDone && m.exercices.every((e) => completed.has(e.id));
  }

  return unlocked;
}

export function computeUnlockedCourses(
  modules: ModuleWithExercices[],
  completed: Set<string>,
): Set<number> {
  const unlocked = new Set<number>();
  let prevAllDone = true;
  for (const m of modules) {
    if (prevAllDone) unlocked.add(m.module);
    prevAllDone =
      prevAllDone && m.exercices.every((e) => completed.has(e.id));
  }
  return unlocked;
}
