import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function signIn() {
  "use server";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) throw error;
  if (data.url) redirect(data.url);
}

export function SignInButton() {
  return (
    <form action={signIn}>
      <button
        type="submit"
        className="border border-stone-700 bg-stone-900 px-4 py-2 text-sm text-stone-200 transition hover:border-amber hover:text-amber"
      >
        <span className="mr-2 text-stone-600">&gt;</span>
        Connexion Google
      </button>
    </form>
  );
}
