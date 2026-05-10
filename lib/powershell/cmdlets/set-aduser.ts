import type { CmdletArgs } from "./index";
import { RuntimeError } from "../executor";
import { findUserBySam } from "../../ad/tree";
import { paramMap, stringy, readBool } from "./_helpers";

export function setADUser({ ctx, command }: CmdletArgs) {
  const p = paramMap(command.params);
  const identity = stringy(p.get("Identity")) ?? stringy(command.positional[0]);
  if (!identity) {
    throw new RuntimeError("Set-ADUser : -Identity <sam> requis");
  }
  const u = findUserBySam(ctx.state, identity);
  if (!u) {
    throw new RuntimeError(
      `Set-ADUser : impossible de trouver un compte '${identity}'`,
    );
  }

  const name = stringy(p.get("Name"));
  if (name !== null) u.name = name;
  const givenName = stringy(p.get("GivenName"));
  if (givenName !== null) u.givenName = givenName;
  const surname = stringy(p.get("Surname"));
  if (surname !== null) u.sn = surname;
  const description = stringy(p.get("Description"));
  if (description !== null) u.description = description;
  const title = stringy(p.get("Title"));
  if (title !== null) u.title = title;
  const department = stringy(p.get("Department"));
  if (department !== null) u.department = department;
  const upn = stringy(p.get("UserPrincipalName"));
  if (upn !== null) u.userPrincipalName = upn;

  const pne = readBool(p.get("PasswordNeverExpires"));
  if (pne !== null) u.passwordNeverExpires = pne;
  const ccp = readBool(p.get("CannotChangePassword"));
  if (ccp !== null) u.cannotChangePassword = ccp;

  u.whenChanged = ctx.state.now;
  return [];
}
