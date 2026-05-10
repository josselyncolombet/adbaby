import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Student } from "@/lib/supabase/types";

export async function requireStudent(): Promise<Student> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/");

  const service = createServiceClient();
  const { data: student } = await service
    .from("students")
    .select("id, email, full_name, is_admin, is_blocked, created_at")
    .eq("email", user.email)
    .maybeSingle();

  if (!student || student.is_blocked) {
    await supabase.auth.signOut();
    redirect("/?blocked=1");
  }

  return student as Student;
}
