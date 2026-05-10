import type { CmdletArgs } from "./index";
import { RuntimeError, evalExpr } from "../executor";
import type { PSValue } from "../value";

export function getADOrganizationalUnit({
  ctx,
  command,
}: CmdletArgs): PSValue[] {
  const params = new Map<string, import("../ast").Expr>();
  for (const p of command.params) if (p.value) params.set(p.name, p.value);
  const filter = params.get("Filter");

  if (!filter) {
    throw new RuntimeError(
      "Get-ADOrganizationalUnit attend un -Filter (ex. -Filter *)",
    );
  }
  return ctx.state.ous
    .filter((ou) => {
      if (filter.kind === "star") return true;
      const ps: PSValue = {
        type: "ADOU",
        raw: ou,
        props: { Name: ou.name, DistinguishedName: ou.dn },
      };
      if (filter.kind === "scriptblock") {
        return Boolean(evalExpr(filter.body.expr, ps));
      }
      throw new RuntimeError("-Filter doit être un scriptblock { ... } ou *");
    })
    .map((ou) => ({
      type: "ADOU",
      raw: ou,
      props: {
        Name: ou.name,
        DistinguishedName: ou.dn,
        ObjectClass: "organizationalUnit",
      },
    }));
}
