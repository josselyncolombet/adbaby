import type { CmdletArgs } from "./index";
import { RuntimeError } from "../executor";
import { findUserBySam, dnExists } from "../../ad/tree";
import { paramMap, stringy, readBool } from "./_helpers";

export function newADUser({ ctx, command }: CmdletArgs) {
  const p = paramMap(command.params);
  const sam = stringy(p.get("SamAccountName"));
  const name = stringy(p.get("Name")) ?? sam;
  const givenName = stringy(p.get("GivenName"));
  const surname = stringy(p.get("Surname"));
  const upn = stringy(p.get("UserPrincipalName"));
  const path = stringy(p.get("Path")) ?? ctx.state.domain.dn;
  const enabledRaw = readBool(p.get("Enabled"));
  const description = stringy(p.get("Description"));
  const title = stringy(p.get("Title"));
  const department = stringy(p.get("Department"));

  if (!sam) {
    throw new RuntimeError("New-ADUser : -SamAccountName est requis");
  }
  if (findUserBySam(ctx.state, sam)) {
    throw new RuntimeError(
      `New-ADUser : un compte '${sam}' existe déjà dans le domaine`,
    );
  }
  if (!dnExists(ctx.state, path)) {
    throw new RuntimeError(`New-ADUser : OU introuvable : ${path}`);
  }

  ctx.state.users.push({
    samAccountName: sam,
    name: name ?? sam,
    givenName: givenName ?? undefined,
    sn: surname ?? undefined,
    displayName: name ?? sam,
    userPrincipalName:
      upn ?? `${sam}@${ctx.state.domain.name}`,
    dn: `CN=${name ?? sam},${path}`,
    parentDn: path,
    enabled: enabledRaw ?? false,
    locked: false,
    passwordNeverExpires: false,
    description: description ?? undefined,
    title: title ?? undefined,
    department: department ?? undefined,
    memberOf: [],
    whenCreated: ctx.state.now,
  });
  return [];
}
