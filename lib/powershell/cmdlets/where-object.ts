import type { CmdletArgs } from "./index";
import { evalExpr, RuntimeError } from "../executor";
import type { PSValue } from "../value";

export function whereObject({
  command,
  input,
}: CmdletArgs): PSValue[] {
  // Where-Object accepte soit un scriptblock positionnel { $_.X -eq Y },
  // soit -FilterScript, soit le mode comparison: -Property X -eq Y.
  const sb =
    command.positional.find((e) => e.kind === "scriptblock") ??
    command.params.find((p) => p.name === "FilterScript")?.value;

  if (sb && sb.kind === "scriptblock") {
    return input.filter((v) => Boolean(evalExpr(sb.body.expr, v)));
  }
  throw new RuntimeError(
    "Where-Object attend un scriptblock { ... } (ex. { $_.Enabled -eq $false })",
  );
}
