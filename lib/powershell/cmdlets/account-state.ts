// Disable-ADAccount, Enable-ADAccount, Unlock-ADAccount, Remove-ADUser
import type { CmdletArgs } from "./index";
import { RuntimeError } from "../executor";
import { findUserBySam } from "../../ad/tree";
import { paramMap, stringy } from "./_helpers";

function targetUser(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const id =
    stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  if (!id) {
    throw new RuntimeError(`-Identity <sam> requis`);
  }
  const u = findUserBySam(args.ctx.state, id);
  if (!u) {
    throw new RuntimeError(`compte '${id}' introuvable`);
  }
  return u;
}

export function disableADAccount(args: CmdletArgs) {
  const u = targetUser(args);
  u.enabled = false;
  u.whenChanged = args.ctx.state.now;
  return [];
}

export function enableADAccount(args: CmdletArgs) {
  const u = targetUser(args);
  u.enabled = true;
  u.whenChanged = args.ctx.state.now;
  return [];
}

export function unlockADAccount(args: CmdletArgs) {
  const u = targetUser(args);
  u.locked = false;
  u.badPwdCount = 0;
  u.whenChanged = args.ctx.state.now;
  return [];
}

export function removeADUser(args: CmdletArgs) {
  const u = targetUser(args);
  args.ctx.state.users = args.ctx.state.users.filter((x) => x !== u);
  // Retirer aussi de tous les groupes
  for (const g of args.ctx.state.groups) {
    g.members = g.members.filter((m) => m !== u.dn);
  }
  return [];
}
