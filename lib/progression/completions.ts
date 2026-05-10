import { createServiceClient } from "@/lib/supabase/service";

export async function getCompletedExoIds(
  studentId: string,
): Promise<Set<string>> {
  const service = createServiceClient();
  const { data, error } = await service
    .from("completions")
    .select("exercise_id")
    .eq("student_id", studentId);
  if (error) {
    console.error("getCompletedExoIds:", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.exercise_id as string));
}

export async function markCompletion(
  studentId: string,
  exerciseId: string,
): Promise<void> {
  const service = createServiceClient();
  const { data: existing } = await service
    .from("completions")
    .select("attempts_count")
    .eq("student_id", studentId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (existing) {
    await service
      .from("completions")
      .update({ attempts_count: existing.attempts_count + 1 })
      .eq("student_id", studentId)
      .eq("exercise_id", exerciseId);
  } else {
    await service.from("completions").insert({
      student_id: studentId,
      exercise_id: exerciseId,
      attempts_count: 1,
    });
  }
}

export async function logAttempt(
  studentId: string,
  exerciseId: string,
  payload: Record<string, unknown>,
  isCorrect: boolean,
): Promise<void> {
  const service = createServiceClient();
  await service.from("attempts").insert({
    student_id: studentId,
    exercise_id: exerciseId,
    payload,
    is_correct: isCorrect,
  });
}
