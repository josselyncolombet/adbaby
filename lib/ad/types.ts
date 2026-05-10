// Modèle Active Directory simulé en mémoire.
// Tous les champs sont calqués sur les attributs vus à l'écrit
// (samAccountName, distinguishedName, memberOf, etc.) pour que le
// rendu PowerShell colle aux annales E7.

export type ADObjectType = "user" | "group" | "computer" | "ou" | "domain";

export interface ADDomain {
  name: string; // ex. "ville-du-parc.local"
  dn: string; // ex. "DC=ville-du-parc,DC=local"
  netbios: string; // ex. "VDP"
  forestFunctionalLevel?: string;
  domainFunctionalLevel?: string;
}

export interface ADOrganizationalUnit {
  name: string;
  dn: string;
  parentDn: string;
  description?: string;
  protectedFromAccidentalDeletion?: boolean;
}

export interface ADUser {
  samAccountName: string;
  userPrincipalName?: string;
  givenName?: string;
  sn?: string; // surname
  displayName?: string;
  name: string; // CN
  dn: string;
  parentDn: string;
  enabled: boolean;
  locked: boolean;
  passwordNeverExpires: boolean;
  cannotChangePassword?: boolean;
  description?: string;
  title?: string;
  department?: string;
  memberOf: string[]; // DNs des groupes
  passwordLastSet?: string; // ISO date
  lastLogonDate?: string; // ISO date
  whenCreated?: string;
  whenChanged?: string;
  badPwdCount?: number;
  pwdLastSetTimestamp?: number;
}

export interface ADGroup {
  samAccountName: string;
  name: string;
  dn: string;
  parentDn: string;
  description?: string;
  groupScope: "DomainLocal" | "Global" | "Universal";
  groupCategory: "Security" | "Distribution";
  members: string[]; // DNs
  protected?: boolean; // AdminSDHolder / ProtectedUsers
}

export interface ADComputer {
  samAccountName: string;
  name: string;
  dn: string;
  parentDn: string;
  enabled: boolean;
  operatingSystem?: string;
  lastLogonDate?: string;
  description?: string;
}

export interface PasswordPolicy {
  minPasswordLength: number;
  passwordHistoryCount: number;
  maxPasswordAge: number; // jours
  minPasswordAge: number; // jours
  complexityEnabled: boolean;
  reversibleEncryptionEnabled: boolean;
  lockoutThreshold: number;
  lockoutDuration: number; // minutes
  lockoutObservationWindow: number; // minutes
}

export interface FineGrainedPasswordPolicy extends PasswordPolicy {
  name: string;
  precedence: number;
  appliesTo: string[]; // DNs (groupes ou users)
}

export interface GPO {
  name: string;
  guid: string;
  domain: string;
  description?: string;
  linkedTo: string[]; // OU/domain DNs
  settings?: Record<string, unknown>;
}

export interface ADSnapshot {
  domain: ADDomain;
  ous: ADOrganizationalUnit[];
  users: ADUser[];
  groups: ADGroup[];
  computers: ADComputer[];
  defaultPasswordPolicy: PasswordPolicy;
  fineGrainedPasswordPolicies?: FineGrainedPasswordPolicy[];
  gpos?: GPO[];
  // Date "actuelle" simulée pour Search-ADAccount -AccountInactive etc.
  now: string; // ISO date
}

export type ADObject = ADUser | ADGroup | ADComputer | ADOrganizationalUnit;
