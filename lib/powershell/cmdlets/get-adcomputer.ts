import type { CmdletArgs } from "./index";
import { evalExpr, RuntimeError } from "../executor";
import { findComputerBySam } from "../../ad/tree";
import { psFromComputer, type PSValue } from "../value";
import type { Expr } from "../ast";

export function getADComputer({ ctx, command }: CmdletArgs): PSValue[] {
  const params = new Map<string, Expr>();
  for (const p of command.params) if (p.value) params.set(p.name, p.value);

  const filter = params.get("Filter");
  const identity =
    params.get("Identity") ??
    (command.positional.length > 0 ? command.positional[0] : undefined);
  const propsList = readList(params.get("Properties"));

  if (filter) {
    return ctx.state.computers
      .filter((c) => {
        if (filter.kind === "star") return true;
        const ps = psFromComputer(c);
        if (filter.kind === "scriptblock") {
          return Boolean(evalExpr(filter.body.expr, ps));
        }
        throw new RuntimeError("-Filter doit être un scriptblock { ... } ou *");
      })
      .map((c) => psFromComputer(c, propsList));
  }
  if (identity) {
    const sam = stringy(identity);
    if (sam === null) {
      throw new RuntimeError("-Identity attend un samAccountName");
    }
    const c = findComputerBySam(ctx.state, sam);
    if (!c) {
      throw new RuntimeError(
        `Get-ADComputer : impossible de trouver un poste nommé '${sam}'`,
      );
    }
    return [psFromComputer(c, propsList)];
  }
  throw new RuntimeError(
    "Get-ADComputer : il faut préciser -Identity <sam> ou -Filter { ... }",
  );
}

function stringy(e: Expr): string | null {
  if (e.kind === "string" || e.kind === "ident") return e.value;
  return null;
}

function readList(e: Expr | undefined): string[] | undefined {
  if (!e) return undefined;
  const s = stringy(e);
  if (s !== null) return [s];
  if (e.kind === "array") {
    return e.items.map(stringy).filter((x): x is string => x !== null);
  }
  return undefined;
}
