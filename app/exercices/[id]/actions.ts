"use server";

import { revalidatePath } from "next/cache";
import { loadById, loadSnapshot } from "@/lib/exercises/loader";
import { execute } from "@/lib/powershell/executor";
import { validate } from "@/lib/exercises/validator";
import { requireStudent } from "@/lib/auth/require-student";
import {
  markCompletion,
  logAttempt,
} from "@/lib/progression/completions";
import type { ValidationResult } from "@/types/exercise";

export async function runAndValidate(
  exerciseId: string,
  command: string,
): Promise<{
  result: ValidationResult;
  output: string;
  errors: string[];
}> {
  const exo = loadById(exerciseId);
  if (!exo) {
    return {
      result: { ok: false, message: "Exercice introuvable." },
      output: "",
      errors: ["Exercice introuvable."],
    };
  }
  const student = await requireStudent();

  const snap = exo.donnees.snapshot ? loadSnapshot(exo.donnees.snapshot) : null;
  let outputText = "";
  let errors: string[] = [];
  if (snap) {
    const r = execute(command, snap);
    outputText = r.text;
    errors = r.errors;
  }
  const result = validate({ exercise: exo, command });
  await logAttempt(student.id, exerciseId, { command }, result.ok);
  if (result.ok) {
    await markCompletion(student.id, exerciseId);
    revalidatePath("/exercices");
    revalidatePath(`/exercices/${exerciseId}`);
  }
  return { result, output: outputText, errors };
}

export async function validateAnswer(
  exerciseId: string,
  answer: string,
): Promise<{ result: ValidationResult }> {
  const exo = loadById(exerciseId);
  if (!exo) {
    return { result: { ok: false, message: "Exercice introuvable." } };
  }
  const student = await requireStudent();
  const result = validate({ exercise: exo, command: answer });
  await logAttempt(student.id, exerciseId, { answer }, result.ok);
  if (result.ok) {
    await markCompletion(student.id, exerciseId);
    revalidatePath("/exercices");
    revalidatePath(`/exercices/${exerciseId}`);
  }
  return { result };
}
