import type { ADSnapshot, ADUser, ADGroup, ADComputer } from "./types";

// Construit un DN à partir d'un CN et d'un parent DN.
export function buildDn(cn: string, parentDn: string): string {
  return `CN=${cn},${parentDn}`;
}

// Trouve un user par samAccountName (case-insensitive, comme AD).
export function findUserBySam(
  s: ADSnapshot,
  sam: string,
): ADUser | undefined {
  const target = sam.toLowerCase();
  return s.users.find((u) => u.samAccountName.toLowerCase() === target);
}

export function findUserByDn(s: ADSnapshot, dn: string): ADUser | undefined {
  return s.users.find((u) => u.dn === dn);
}

export function findGroupBySam(
  s: ADSnapshot,
  sam: string,
): ADGroup | undefined {
  const target = sam.toLowerCase();
  return s.groups.find((g) => g.samAccountName.toLowerCase() === target);
}

export function findGroupByDn(s: ADSnapshot, dn: string): ADGroup | undefined {
  return s.groups.find((g) => g.dn === dn);
}

export function findComputerBySam(
  s: ADSnapshot,
  sam: string,
): ADComputer | undefined {
  const target = sam.toLowerCase();
  return s.computers.find((c) => c.samAccountName.toLowerCase() === target);
}

// Vérifie qu'un DN existe (OU, domain root ou container connu).
export function dnExists(s: ADSnapshot, dn: string): boolean {
  if (dn === s.domain.dn) return true;
  if (s.ous.some((ou) => ou.dn === dn)) return true;
  return false;
}
