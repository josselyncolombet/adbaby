import type { ModuleInfo, ModuleWithExercices } from "@/types/exercise";
import { loadAll } from "./loader";

export const MODULES: ModuleInfo[] = [
  { module: 1, titre: "Bases AD : domaine, OU, comptes" },
  { module: 2, titre: "Lire l'AD : Get-AD* et pipeline" },
  { module: 3, titre: "Modifier l'AD : New / Set / Remove" },
  { module: 4, titre: "Groupes et appartenances" },
  { module: 5, titre: "Mots de passe et verrouillage" },
  { module: 6, titre: "Comptes privilégiés et sécurité" },
  { module: 7, titre: "GPO et stratégies" },
  { module: 8, titre: "Audit et incident" },
];

export function getModules(): ModuleWithExercices[] {
  const exos = loadAll();
  return MODULES.map((m) => ({
    ...m,
    exercices: exos
      .filter((e) => e.module === m.module)
      .sort((a, b) => a.ordre - b.ordre)
      .map((e) => ({
        id: e.id,
        ordre: e.ordre,
        titre: e.titre,
        difficulte: e.difficulte,
      })),
  })).filter((m) => m.exercices.length > 0);
}
