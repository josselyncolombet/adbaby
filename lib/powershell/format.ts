// Formatage par défaut comme la console PowerShell réelle :
// - aucune entrée → vide
// - 1 seul AD object → Format-List (chaque propriété sur sa ligne)
// - plusieurs → Format-Table sur 4 colonnes par défaut
// - autre type → sortie best-effort

import type { PSValue } from "./value";

const DEFAULT_LIST_COLS: Record<string, string[]> = {
  ADUser: [
    "DistinguishedName",
    "Enabled",
    "GivenName",
    "Name",
    "ObjectClass",
    "SamAccountName",
    "Surname",
    "UserPrincipalName",
  ],
  ADGroup: [
    "DistinguishedName",
    "GroupCategory",
    "GroupScope",
    "Name",
    "ObjectClass",
    "SamAccountName",
  ],
  ADComputer: [
    "DistinguishedName",
    "DNSHostName",
    "Enabled",
    "Name",
    "ObjectClass",
    "OperatingSystem",
    "SamAccountName",
  ],
  ADOU: ["DistinguishedName", "Name", "ObjectClass"],
  ADPasswordPolicy: [
    "ComplexityEnabled",
    "LockoutDuration",
    "LockoutObservationWindow",
    "LockoutThreshold",
    "MaxPasswordAge",
    "MinPasswordAge",
    "MinPasswordLength",
    "PasswordHistoryCount",
    "ReversibleEncryptionEnabled",
  ],
};

const DEFAULT_TABLE_COLS: Record<string, string[]> = {
  ADUser: ["Name", "SamAccountName", "Enabled"],
  ADGroup: ["Name", "GroupCategory", "GroupScope"],
  ADComputer: ["Name", "DNSHostName", "Enabled", "OperatingSystem"],
  ADOU: ["Name", "DistinguishedName"],
};

export function formatOutput(values: PSValue[]): string {
  if (values.length === 0) return "";
  const t = values[0].type;
  const isList = t.endsWith("@List") || values.length === 1;
  const baseType = t.replace(/@List$/, "");

  if (isList) return formatList(values, baseType);
  return formatTable(values, baseType);
}

function formatList(values: PSValue[], baseType: string): string {
  const cols = DEFAULT_LIST_COLS[baseType] ?? Object.keys(values[0].props ?? {});
  const labelWidth = Math.max(...cols.map((c) => c.length));
  const blocks: string[] = [];
  for (const v of values) {
    const lines: string[] = [];
    for (const c of cols) {
      const value = stringify(getCaseInsensitive(v.props, c));
      lines.push(`${pad(c, labelWidth)} : ${value}`);
    }
    blocks.push(lines.join("\n"));
  }
  return "\n\n" + blocks.join("\n\n") + "\n\n";
}

function formatTable(values: PSValue[], baseType: string): string {
  const cols =
    DEFAULT_TABLE_COLS[baseType] ?? Object.keys(values[0].props ?? {}).slice(0, 4);
  const rows = values.map((v) =>
    cols.map((c) => stringify(getCaseInsensitive(v.props, c))),
  );
  const widths = cols.map((c, idx) =>
    Math.max(c.length, ...rows.map((r) => r[idx].length)),
  );
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  const header = cols.map((c, idx) => pad(c, widths[idx])).join("  ");
  const body = rows
    .map((r) => r.map((cell, idx) => pad(cell, widths[idx])).join("  "))
    .join("\n");
  return `\n${header}\n${sep}\n${body}\n`;
}

function pad(s: string, w: number): string {
  return s + " ".repeat(Math.max(0, w - s.length));
}

function getCaseInsensitive(
  props: Record<string, unknown> | undefined,
  key: string,
): unknown {
  if (!props) return undefined;
  const k = key.toLowerCase();
  for (const p of Object.keys(props)) {
    if (p.toLowerCase() === k) return props[p];
  }
  return undefined;
}

export function stringify(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (Array.isArray(v)) return "{" + v.map((x) => stringify(x)).join(", ") + "}";
  return String(v);
}
