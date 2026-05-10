export type ExerciseType =
  | "compare-output"
  | "compare-state"
  | "qcm"
  | "audit"
  | "syntax-match";

export type Difficulte = "facile" | "moyen" | "difficile";

export interface ExerciseDonnees {
  // compare-output / compare-state
  snapshot?: string; // nom du fichier dans content/etats/ (sans .json)
  // pré-remplir le terminal — utile pour les exos "adapter un script"
  initialCode?: string;
  // qcm
  options?: { value: string; label: string }[];
  // audit
  anomalies?: { value: string; label: string }[];
}

export type Solution =
  | {
      type: "compare-output";
      // Solution canonique = liste de samAccountName (ordre indifférent)
      // ou liste de DNs. On normalise lower-case + sort avant compare.
      sams?: string[];
      dns?: string[];
      // Alternativement, regex sur la sortie texte (Measure-Object Count etc.)
      outputContains?: string[];
      // Variante : exécution de référence — on lance la commande de
      // référence et on compare avec celle de l'élève.
      reference?: string;
    }
  | {
      type: "compare-state";
      reference: string; // commandes PowerShell de référence
    }
  | { type: "qcm"; bonneReponse: string }
  | { type: "audit"; bonnesReponses: string[] }
  | {
      type: "syntax-match";
      // Le but est juste de taper la bonne commande : on compare la
      // commande normalisée (espaces collapsés, paramètres triés).
      reference: string;
    };

export interface Exercise {
  id: string;
  module: number;
  ordre: number;
  titre: string;
  difficulte: Difficulte;
  concepts: string[];
  contexte: string;
  enonce: string;
  indices: string[];
  type: ExerciseType;
  donnees: ExerciseDonnees;
  solution: Solution;
  validation: {
    tolerance?: "stricte" | "normaliser";
    ordreImporte?: boolean;
  };
}

export interface ValidationOk {
  ok: true;
  message?: string;
}

export interface ValidationKo {
  ok: false;
  message: string;
  attendu?: string;
  obtenu?: string;
  details?: string[];
}

export type ValidationResult = ValidationOk | ValidationKo;

export interface ModuleInfo {
  module: number;
  titre: string;
  cours?: string;
}

export interface ModuleWithExercices extends ModuleInfo {
  exercices: Pick<Exercise, "id" | "ordre" | "titre" | "difficulte">[];
}
