import type { CmdletArgs } from "./index";
import { evalExpr, RuntimeError } from "../executor";
import { findGroupBySam } from "../../ad/tree";
import { psFromGroup, type PSValue } from "../value";
import type { Expr } from "../ast";

export function getADGroup({ ctx, command }: CmdletArgs): PSValue[] {
  const params = paramMap(command.params);
  const positional = command.positional;
  const filter = params.get("Filter");
  const identity =
    params.get("Identity") ?? (positional.length > 0 ? positional[0] : undefined);
  const propsList = readStringList(params.get("Properties"));

  if (filter) {
    return ctx.state.groups
      .filter((g) => {
        if (filter.kind === "star") return true;
        const ps = psFromGroup(g);
        if (filter.kind === "scriptblock") {
          return Boolean(evalExpr(filter.body.expr, ps));
        }
        throw new RuntimeError("-Filter doit être un scriptblock { ... } ou *");
      })
      .map((g) => psFromGroup(g, propsList));
  }
  if (identity) {
    const sam = stringy(identity);
    if (sam === null) {
      throw new RuntimeError("-Identity attend un samAccountName");
    }
    const g = findGroupBySam(ctx.state, sam);
    if (!g) {
      throw new RuntimeError(
        `Get-ADGroup : impossible de trouver un groupe nommé '${sam}'`,
      );
    }
    return [psFromGroup(g, propsList)];
  }
  throw new RuntimeError(
    "Get-ADGroup : il faut préciser -Identity <sam> ou -Filter { ... }",
  );
}

function paramMap(params: { name: string; value?: Expr }[]) {
  const m = new Map<string, Expr>();
  for (const p of params) if (p.value) m.set(p.name, p.value);
  return m;
}

function stringy(e: Expr): string | null {
  if (e.kind === "string" || e.kind === "ident") return e.value;
  return null;
}

function readStringList(expr: Expr | undefined): string[] | undefined {
  if (!expr) return undefined;
  const s = stringy(expr);
  if (s !== null) return [s];
  if (expr.kind === "array") {
    return expr.items.map(stringy).filter((x): x is string => x !== null);
  }
  return undefined;
}
