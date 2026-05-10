import type { CmdletArgs } from "./index";
import { getProp, type PSValue } from "../value";
import type { Expr } from "../ast";

export function sortObject({ command, input }: CmdletArgs): PSValue[] {
  const propParam = command.params.find(
    (p) => p.name === "Property",
  )?.value;
  const desc = command.params.some(
    (p) => p.name === "Descending",
  );
  const propsFromPositional = command.positional
    .map(toStr)
    .filter((s): s is string => s !== null);
  const props =
    extractStringList(propParam) ??
    (propsFromPositional.length ? propsFromPositional : undefined);

  const out = input.slice();
  out.sort((a, b) => {
    if (!props) return 0;
    for (const p of props) {
      const av = getProp(a, p);
      const bv = getProp(b, p);
      const c = compare(av, bv);
      if (c !== 0) return desc ? -c : c;
    }
    return 0;
  });
  return out;
}

function extractStringList(expr: Expr | undefined): string[] | undefined {
  if (!expr) return undefined;
  if (expr.kind === "string") return [expr.value];
  if (expr.kind === "array") {
    return expr.items.map(toStr).filter((s): s is string => s !== null);
  }
  return undefined;
}

function toStr(e: Expr): string | null {
  if (e.kind === "string") return e.value;
  if (e.kind === "ident") return e.value;
  return null;
}

function compare(a: unknown, b: unknown): number {
  if (a === undefined || a === null) return b === undefined || b === null ? 0 : -1;
  if (b === undefined || b === null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}
