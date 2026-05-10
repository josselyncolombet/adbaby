"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;
  const service = createServiceClient();
  const { data } = await service
    .from("students")
    .select("is_admin")
    .eq("email", user.email)
    .maybeSingle();
  return !!data?.is_admin;
}

export async function setStudentBlocked(
  studentId: string,
  blocked: boolean,
): Promise<{ ok: boolean }> {
  if (!(await requireAdmin())) return { ok: false };
  const service = createServiceClient();
  await service
    .from("students")
    .update({ is_blocked: blocked })
    .eq("id", studentId);
  revalidatePath(`/admin/${studentId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function markExerciseCompleted(
  studentId: string,
  exerciseId: string,
): Promise<{ ok: boolean }> {
  if (!(await requireAdmin())) return { ok: false };
  const service = createServiceClient();
  const { data: existing } = await service
    .from("completions")
    .select("attempts_count")
    .eq("student_id", studentId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();
  if (!existing) {
    await service.from("completions").insert({
      student_id: studentId,
      exercise_id: exerciseId,
      attempts_count: 0,
    });
  }
  revalidatePath(`/admin/${studentId}`);
  return { ok: true };
}

export async function unmarkExercise(
  studentId: string,
  exerciseId: string,
): Promise<{ ok: boolean }> {
  if (!(await requireAdmin())) return { ok: false };
  const service = createServiceClient();
  await service
    .from("completions")
    .delete()
    .eq("student_id", studentId)
    .eq("exercise_id", exerciseId);
  revalidatePath(`/admin/${studentId}`);
  return { ok: true };
}

export async function resetStudentProgress(
  studentId: string,
): Promise<{ ok: boolean }> {
  if (!(await requireAdmin())) return { ok: false };
  const service = createServiceClient();
  await service.from("completions").delete().eq("student_id", studentId);
  revalidatePath(`/admin/${studentId}`);
  revalidatePath("/admin");
  return { ok: true };
}
