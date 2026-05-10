export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="text-xs uppercase tracking-wider text-stone-500 transition hover:text-amber"
      >
        sortir
      </button>
    </form>
  );
}
