import type { CmdletArgs } from "./index";
import { RuntimeError } from "../executor";
import { findUserBySam, dnExists } from "../../ad/tree";
import { paramMap, stringy } from "./_helpers";

// Move-ADObject : on supporte le déplacement d'un user uniquement (cas E7).
export function moveADObject(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const identity = stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  const target = stringy(p.get("TargetPath"));
  if (!identity) throw new RuntimeError("Move-ADObject : -Identity requis");
  if (!target) throw new RuntimeError("Move-ADObject : -TargetPath requis");
  if (!dnExists(args.ctx.state, target)) {
    throw new RuntimeError(`Move-ADObject : OU cible introuvable : ${target}`);
  }
  // -Identity peut être un DN ou un samAccountName
  let user = findUserBySam(args.ctx.state, identity);
  if (!user) {
    user = args.ctx.state.users.find((u) => u.dn === identity);
  }
  if (!user) {
    throw new RuntimeError(`Move-ADObject : compte introuvable : ${identity}`);
  }
  // Reconstruire le DN avec le nouveau parent
  const cn = user.dn.split(",")[0];
  user.parentDn = target;
  user.dn = `${cn},${target}`;
  user.whenChanged = args.ctx.state.now;
  return [];
}
