import type { CmdletArgs } from "./index";
import { getProp, type PSValue } from "../value";
import type { Expr } from "../ast";

export function selectObject({ command, input }: CmdletArgs): PSValue[] {
  const propParam = command.params.find(
    (p) => p.name === "Property" || p.name === "p",
  )?.value;
  const firstParam = command.params.find((p) => p.name === "First")?.value;
  const lastParam = command.params.find((p) => p.name === "Last")?.value;

  const propsFromPositional = command.positional
    .map(stringifyExpr)
    .filter((s): s is string => s !== null);

  const props =
    extractStringList(propParam) ??
    (propsFromPositional.length ? propsFromPositional : undefined);

  let out = input.slice();
  if (firstParam && firstParam.kind === "number") {
    out = out.slice(0, firstParam.value);
  }
  if (lastParam && lastParam.kind === "number") {
    out = out.slice(-lastParam.value);
  }

  if (!props) return out;

  return out.map((v) => {
    const projected: Record<string, unknown> = {};
    for (const p of props) {
      projected[p] = getProp(v, p);
    }
    return { type: "Selected", raw: v.raw, props: projected };
  });
}

function extractStringList(expr: Expr | undefined): string[] | undefined {
  if (!expr) return undefined;
  if (expr.kind === "string") return [expr.value];
  if (expr.kind === "array") {
    return expr.items
      .map(stringifyExpr)
      .filter((s): s is string => s !== null);
  }
  return undefined;
}

function stringifyExpr(e: Expr): string | null {
  if (e.kind === "string") return e.value;
  if (e.kind === "ident") return e.value;
  return null;
}
