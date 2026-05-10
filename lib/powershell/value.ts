// Représentation des valeurs qui circulent dans le pipeline.
// On veut un truc proche de PSObject : un objet avec des propriétés
// nommées + un type d'origine pour décider du formatage par défaut.

export interface PSValue {
  type: string; // ex. "ADUser", "ADGroup", "ADComputer", "String", "Int32"
  raw: unknown; // valeur native pour comparaisons
  props?: Record<string, unknown>; // propriétés exposées
}

export function psFromUser(u: unknown, props?: string[]): PSValue {
  const o = u as Record<string, unknown>;
  const all: Record<string, unknown> = { ...o };
  // Renommages cosmétiques pour coller à PowerShell
  all.Enabled = o.enabled;
  all.LockedOut = o.locked;
  all.SamAccountName = o.samAccountName;
  all.UserPrincipalName = o.userPrincipalName;
  all.GivenName = o.givenName;
  all.Surname = o.sn;
  all.DisplayName = o.displayName;
  all.Name = o.name;
  all.DistinguishedName = o.dn;
  all.MemberOf = o.memberOf;
  all.Description = o.description;
  all.PasswordNeverExpires = o.passwordNeverExpires;
  all.LastLogonDate = o.lastLogonDate;
  all.PasswordLastSet = o.passwordLastSet;
  all.WhenCreated = o.whenCreated;
  all.Title = o.title;
  all.Department = o.department;
  all.ObjectClass = "user";
  return { type: "ADUser", raw: u, props: filterProps(all, props) };
}

export function psFromGroup(g: unknown, props?: string[]): PSValue {
  const o = g as Record<string, unknown>;
  const all: Record<string, unknown> = { ...o };
  all.SamAccountName = o.samAccountName;
  all.Name = o.name;
  all.DistinguishedName = o.dn;
  all.GroupScope = o.groupScope;
  all.GroupCategory = o.groupCategory;
  all.Members = o.members;
  all.Description = o.description;
  all.ObjectClass = "group";
  return { type: "ADGroup", raw: g, props: filterProps(all, props) };
}

export function psFromComputer(c: unknown, props?: string[]): PSValue {
  const o = c as Record<string, unknown>;
  const all: Record<string, unknown> = { ...o };
  all.SamAccountName = o.samAccountName;
  all.Name = o.name;
  all.DistinguishedName = o.dn;
  all.Enabled = o.enabled;
  all.OperatingSystem = o.operatingSystem;
  all.LastLogonDate = o.lastLogonDate;
  all.ObjectClass = "computer";
  return { type: "ADComputer", raw: c, props: filterProps(all, props) };
}

function filterProps(
  all: Record<string, unknown>,
  whitelist?: string[],
): Record<string, unknown> {
  // PowerShell: -Properties ajoute au jeu par défaut, n'y substitue pas.
  // On retourne donc tout, peu importe la whitelist (elle sert seulement
  // à signaler à l'utilisateur les props qu'il voulait voir).
  return all;
}

export function getProp(v: PSValue, name: string): unknown {
  if (!v.props) return undefined;
  // PowerShell : property access case-insensitive
  const target = name.toLowerCase();
  for (const k of Object.keys(v.props)) {
    if (k.toLowerCase() === target) return v.props[k];
  }
  return undefined;
}
