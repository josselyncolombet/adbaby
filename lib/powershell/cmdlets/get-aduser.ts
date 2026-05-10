import type { CmdletArgs } from "./index";
import { evalExpr, RuntimeError } from "../executor";
import { findUserBySam } from "../../ad/tree";
import { psFromUser, type PSValue } from "../value";

export function getADUser({ ctx, command }: CmdletArgs): PSValue[] {
  const params = mapParams(command.params);
  const positional = command.positional;

  const propsList = readStringList(params.get("Properties"));
  const filter = params.get("Filter");
  const identity =
    params.get("Identity") ??
    (positional.length > 0 ? positional[0] : undefined);

  if (filter) {
    return ctx.state.users
      .filter((u) => {
        if (filter.kind === "star") return true;
        const ps = psFromUser(u);
        if (filter.kind === "scriptblock") {
          return Boolean(evalExpr(filter.body.expr, ps));
        }
        if (filter.kind === "string" && filter.value === "*") return true;
        throw new RuntimeError(
          "-Filter doit être un scriptblock { ... } ou *",
        );
      })
      .map((u) => psFromUser(u, propsList));
  }

  if (identity) {
    const sam = stringy(identity);
    if (sam === null) {
      throw new RuntimeError("-Identity attend un samAccountName");
    }
    const u = findUserBySam(ctx.state, sam);
    if (!u) {
      throw new RuntimeError(
        `Get-ADUser : impossible de trouver un objet avec l'identité '${sam}'`,
      );
    }
    return [psFromUser(u, propsList)];
  }

  throw new RuntimeError(
    "Get-ADUser : il faut préciser -Identity <sam> ou -Filter { ... }",
  );
}

function mapParams(params: { name: string; value?: import("../ast").Expr }[]) {
  const m = new Map<string, import("../ast").Expr>();
  for (const p of params) {
    if (p.value) m.set(p.name, p.value);
  }
  return m;
}

function stringy(expr: import("../ast").Expr): string | null {
  if (expr.kind === "string") return expr.value;
  if (expr.kind === "ident") return expr.value;
  return null;
}

function readStringList(
  expr: import("../ast").Expr | undefined,
): string[] | undefined {
  if (!expr) return undefined;
  const single = stringy(expr);
  if (single !== null) return [single];
  if (expr.kind === "array") {
    return expr.items
      .map((i) => stringy(i))
      .filter((s): s is string => s !== null);
  }
  return undefined;
}
