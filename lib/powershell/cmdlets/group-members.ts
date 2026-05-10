// Add/Remove-ADGroupMember, Get-ADGroupMember, New-ADGroup, Remove-ADGroup
import type { CmdletArgs } from "./index";
import { RuntimeError } from "../executor";
import {
  findGroupBySam,
  findUserBySam,
  findUserByDn,
  findGroupByDn,
  dnExists,
} from "../../ad/tree";
import { paramMap, stringy, readList } from "./_helpers";
import { psFromUser, psFromGroup, type PSValue } from "../value";

function resolveMembers(
  ctx: CmdletArgs["ctx"],
  members: string[],
): { dn: string; sam: string }[] {
  const out: { dn: string; sam: string }[] = [];
  for (const m of members) {
    const u = findUserBySam(ctx.state, m) ?? findUserByDn(ctx.state, m);
    if (u) {
      out.push({ dn: u.dn, sam: u.samAccountName });
      continue;
    }
    const g = findGroupBySam(ctx.state, m) ?? findGroupByDn(ctx.state, m);
    if (g) {
      out.push({ dn: g.dn, sam: g.samAccountName });
      continue;
    }
    throw new RuntimeError(`membre introuvable : ${m}`);
  }
  return out;
}

export function addADGroupMember(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const ident = stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  const members = readList(p.get("Members"));
  if (!ident) throw new RuntimeError("Add-ADGroupMember : -Identity <groupe> requis");
  if (!members || members.length === 0) {
    throw new RuntimeError("Add-ADGroupMember : -Members <user1,user2> requis");
  }
  const g = findGroupBySam(args.ctx.state, ident);
  if (!g) throw new RuntimeError(`groupe '${ident}' introuvable`);
  const resolved = resolveMembers(args.ctx, members);
  for (const r of resolved) {
    if (!g.members.includes(r.dn)) g.members.push(r.dn);
    const u = findUserByDn(args.ctx.state, r.dn);
    if (u && !u.memberOf.includes(g.dn)) u.memberOf.push(g.dn);
  }
  return [];
}

export function removeADGroupMember(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const ident = stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  const members = readList(p.get("Members"));
  if (!ident) throw new RuntimeError("Remove-ADGroupMember : -Identity requis");
  if (!members) throw new RuntimeError("Remove-ADGroupMember : -Members requis");
  const g = findGroupBySam(args.ctx.state, ident);
  if (!g) throw new RuntimeError(`groupe '${ident}' introuvable`);
  const resolved = resolveMembers(args.ctx, members);
  for (const r of resolved) {
    g.members = g.members.filter((m) => m !== r.dn);
    const u = findUserByDn(args.ctx.state, r.dn);
    if (u) u.memberOf = u.memberOf.filter((m) => m !== g.dn);
  }
  return [];
}

export function getADGroupMember(args: CmdletArgs): PSValue[] {
  const p = paramMap(args.command.params);
  const ident = stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  if (!ident) throw new RuntimeError("Get-ADGroupMember : -Identity requis");
  const g = findGroupBySam(args.ctx.state, ident);
  if (!g) throw new RuntimeError(`groupe '${ident}' introuvable`);
  const out: PSValue[] = [];
  for (const dn of g.members) {
    const u = findUserByDn(args.ctx.state, dn);
    if (u) {
      out.push(psFromUser(u));
      continue;
    }
    const sub = findGroupByDn(args.ctx.state, dn);
    if (sub) {
      out.push(psFromGroup(sub));
    }
  }
  return out;
}

export function newADGroup(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const name = stringy(p.get("Name"));
  const sam = stringy(p.get("SamAccountName")) ?? name;
  const path = stringy(p.get("Path")) ?? args.ctx.state.domain.dn;
  const scope = (stringy(p.get("GroupScope")) ?? "Global") as
    | "Global"
    | "DomainLocal"
    | "Universal";
  const category = (stringy(p.get("GroupCategory")) ?? "Security") as
    | "Security"
    | "Distribution";
  const description = stringy(p.get("Description"));

  if (!name) throw new RuntimeError("New-ADGroup : -Name requis");
  if (!sam) throw new RuntimeError("New-ADGroup : -SamAccountName requis");
  if (findGroupBySam(args.ctx.state, sam)) {
    throw new RuntimeError(`New-ADGroup : un groupe '${sam}' existe déjà`);
  }
  if (!dnExists(args.ctx.state, path)) {
    throw new RuntimeError(`New-ADGroup : OU introuvable : ${path}`);
  }
  args.ctx.state.groups.push({
    samAccountName: sam,
    name,
    dn: `CN=${name},${path}`,
    parentDn: path,
    groupScope: scope,
    groupCategory: category,
    members: [],
    description: description ?? undefined,
  });
  return [];
}

export function removeADGroup(args: CmdletArgs) {
  const p = paramMap(args.command.params);
  const ident = stringy(p.get("Identity")) ?? stringy(args.command.positional[0]);
  if (!ident) throw new RuntimeError("Remove-ADGroup : -Identity requis");
  const g = findGroupBySam(args.ctx.state, ident);
  if (!g) throw new RuntimeError(`groupe '${ident}' introuvable`);
  args.ctx.state.groups = args.ctx.state.groups.filter((x) => x !== g);
  for (const u of args.ctx.state.users) {
    u.memberOf = u.memberOf.filter((m) => m !== g.dn);
  }
  return [];
}
