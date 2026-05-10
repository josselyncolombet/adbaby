import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=1", url.origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/?auth_error=1", url.origin));
  }

  const email = data.user.email;
  const fullName =
    (data.user.user_metadata?.full_name as string | undefined) ??
    (data.user.user_metadata?.name as string | undefined) ??
    email.split("@")[0];

  const service = createServiceClient();
  const { data: student } = await service
    .from("students")
    .select("id, is_admin, is_blocked")
    .eq("email", email)
    .maybeSingle();

  if (student?.is_blocked) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/?blocked=1", url.origin));
  }

  if (!student) {
    await service.from("students").insert({
      email,
      full_name: fullName,
      is_admin: false,
      is_blocked: false,
    });
    return NextResponse.redirect(new URL("/exercices", url.origin));
  }

  return NextResponse.redirect(
    new URL(student.is_admin ? "/admin" : "/exercices", url.origin),
  );
}
