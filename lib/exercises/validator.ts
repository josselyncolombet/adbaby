import type { Exercise, ValidationResult } from "@/types/exercise";
import { execute } from "@/lib/powershell/executor";
import { canonicalize, cloneSnapshot } from "@/lib/ad/snapshot";
import { loadSnapshot } from "./loader";

export interface SubmitArgs {
  exercise: Exercise;
  command: string; // ce que l'élève a tapé
}

export function validate({ exercise, command }: SubmitArgs): ValidationResult {
  const trimmed = command.trim();
  if (!trimmed) {
    return { ok: false, message: "Tape une commande PowerShell." };
  }

  switch (exercise.type) {
    case "compare-output":
      return validateCompareOutput(exercise, trimmed);
    case "compare-state":
      return validateCompareState(exercise, trimmed);
    case "syntax-match":
      return validateSyntaxMatch(exercise, trimmed);
    case "qcm":
      return validateQcm(exercise, trimmed);
    case "audit":
      return validateAudit(exercise, trimmed);
    default:
      return {
        ok: false,
        message: `Type d'exercice non supporté : ${exercise.type}`,
      };
  }
}

function validateQcm(exercise: Exercise, answer: string): ValidationResult {
  if (exercise.solution.type !== "qcm") {
    return { ok: false, message: "Solution mal typée." };
  }
  if (answer.trim() === exercise.solution.bonneReponse) {
    return { ok: true, message: "Bonne réponse." };
  }
  return {
    ok: false,
    message: "Mauvaise réponse, relis l'énoncé.",
  };
}

function validateAudit(exercise: Exercise, answer: string): ValidationResult {
  if (exercise.solution.type !== "audit") {
    return { ok: false, message: "Solution mal typée." };
  }
  const got = answer
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
  const expected = exercise.solution.bonnesReponses.slice().sort();
  if (got.length === expected.length && got.every((x, i) => x === expected[i])) {
    return { ok: true, message: "Toutes les anomalies relevées." };
  }
  const missing = expected.filter((e) => !got.includes(e));
  const extra = got.filter((g) => !expected.includes(g));
  const details: string[] = [];
  if (missing.length) details.push(`oublié : ${missing.join(", ")}`);
  if (extra.length) details.push(`en trop : ${extra.join(", ")}`);
  return {
    ok: false,
    message: "Réponse partielle.",
    details,
  };
}

function validateCompareOutput(
  exercise: Exercise,
  command: string,
): ValidationResult {
  if (exercise.solution.type !== "compare-output") {
    return { ok: false, message: "Solution mal typée." };
  }
  const snap = loadSnap(exercise);
  if (!snap) {
    return {
      ok: false,
      message: `Snapshot introuvable : ${exercise.donnees.snapshot}`,
    };
  }
  const r = execute(command, snap);
  if (r.errors.length > 0) {
    return { ok: false, message: r.errors[0] };
  }

  const sol = exercise.solution;
  if (sol.sams) {
    const got = r.output
      .map((v) => stringProp(v.props, "SamAccountName"))
      .filter((s): s is string => !!s)
      .map((s) => s.toLowerCase())
      .sort();
    const expected = sol.sams.map((s) => s.toLowerCase()).sort();
    if (sameList(got, expected)) {
      return { ok: true, message: "Bonne commande." };
    }
    return {
      ok: false,
      message: "Le résultat ne correspond pas aux comptes attendus.",
      attendu: expected.join(", "),
      obtenu: got.join(", ") || "(aucun compte renvoyé)",
    };
  }
  if (sol.dns) {
    const got = r.output
      .map((v) => stringProp(v.props, "DistinguishedName"))
      .filter((s): s is string => !!s)
      .sort();
    const expected = sol.dns.slice().sort();
    if (sameList(got, expected)) return { ok: true };
    return {
      ok: false,
      message: "Les DNs renvoyés ne correspondent pas.",
      attendu: expected.join("\n"),
      obtenu: got.join("\n"),
    };
  }
  if (sol.outputContains) {
    const text = r.text;
    const missing = sol.outputContains.filter((s) => !text.includes(s));
    if (missing.length === 0) return { ok: true };
    return {
      ok: false,
      message: "Il manque des éléments dans la sortie.",
      details: missing.map((s) => `attendu : ${s}`),
    };
  }
  return { ok: false, message: "Solution mal formée." };
}

function validateCompareState(
  exercise: Exercise,
  command: string,
): ValidationResult {
  if (exercise.solution.type !== "compare-state") {
    return { ok: false, message: "Solution mal typée." };
  }
  const snap = loadSnap(exercise);
  if (!snap) {
    return {
      ok: false,
      message: `Snapshot introuvable : ${exercise.donnees.snapshot}`,
    };
  }
  const refRun = execute(exercise.solution.reference, cloneSnapshot(snap));
  if (refRun.errors.length > 0) {
    return {
      ok: false,
      message: `Erreur interne (référence) : ${refRun.errors[0]}`,
    };
  }
  const studentRun = execute(command, cloneSnapshot(snap));
  if (studentRun.errors.length > 0) {
    return { ok: false, message: studentRun.errors[0] };
  }
  if (canonicalize(refRun.finalState) === canonicalize(studentRun.finalState)) {
    return { ok: true, message: "État AD conforme." };
  }
  return {
    ok: false,
    message: "L'état final de l'AD ne correspond pas à ce qui était attendu.",
  };
}

function validateSyntaxMatch(
  exercise: Exercise,
  command: string,
): ValidationResult {
  if (exercise.solution.type !== "syntax-match") {
    return { ok: false, message: "Solution mal typée." };
  }
  if (normCmd(command) === normCmd(exercise.solution.reference)) {
    return { ok: true };
  }
  return {
    ok: false,
    message: "La syntaxe ne correspond pas.",
    attendu: exercise.solution.reference,
    obtenu: command,
  };
}

function loadSnap(exercise: Exercise) {
  const name = exercise.donnees.snapshot;
  if (!name) return null;
  return loadSnapshot(name);
}

function stringProp(
  props: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!props) return undefined;
  const v = props[key];
  return typeof v === "string" ? v : undefined;
}

function sameList(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => x === b[i]);
}

function normCmd(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}
