// Vérifie que CHAQUE exo a une commande canonique qui valide.
// Pour les compare-output, on maintient une table id → commande à tester.
// Pour le reste, on prend la solution de référence (compare-state / qcm / audit).

import { loadAll } from "../lib/exercises/loader";
import { validate } from "../lib/exercises/validator";

// Commandes canoniques attendues pour les compare-output.
// Tous les compare-output du catalogue doivent figurer ici.
const COMPARE_OUTPUT_CMDS: Record<string, string> = {
  // M2 — Lecture
  "m2-identity-01": "Get-ADUser -Identity j.dupont",
  "m2-identity-02": "Get-ADUser -Identity s.lefevre -Properties LastLogonDate",
  "m2-identity-03": "Get-ADUser -Identity a.dupont -Properties MemberOf",
  "m2-filter-01": "Get-ADUser -Filter *",
  "m2-filter-02": "Get-ADUser -Filter { Enabled -eq $false }",
  "m2-filter-03": "Get-ADUser -Filter { Department -eq \"Compta\" }",
  "m2-types-01": "Get-ADGroup -Filter *",
  "m2-types-02": "Get-ADComputer -Filter *",
  "m2-types-03": "Get-ADOrganizationalUnit -Filter *",
  "m2-pipe-01": "Get-ADUser -Filter * | Where-Object { $_.LockedOut -eq $true }",
  "m2-pipe-02":
    "Get-ADUser -Filter * -Properties PasswordNeverExpires | Where-Object { $_.PasswordNeverExpires -eq $true }",
  "m2-pipe-03":
    "Get-ADUser -Filter { Department -eq \"Production\" -and Enabled -eq $true }",
  "m2-pipe2-01": "Get-ADUser -Filter * | Measure-Object",
  "m2-pipe2-02":
    "Get-ADUser -Filter * -Properties LastLogonDate | Sort-Object LastLogonDate",
  "m2-pipe2-03":
    "Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled",
  // M2 C6 — Adapter un script
  "m2-script-01": "Get-ADUser -Filter { Department -eq \"Compta\" }",
  "m2-script-02":
    "Get-ADUser -Filter * | Where-Object { $_.LockedOut -eq $true }",
  "m2-script-03":
    "Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Where-Object { $_.Enabled -eq $true }",
  // M4 — Get-ADGroupMember
  "m4-list-01": "Get-ADGroupMember -Identity \"Domain Admins\"",
  "m4-list-02": "Get-ADGroupMember -Identity G_Compta",
  "m4-list-03":
    "Get-ADGroupMember -Identity \"Domain Admins\" | Measure-Object",
  // M5 — Politique + Search-ADAccount
  "m5-pol-01": "Get-ADDefaultDomainPasswordPolicy",
  "m5-search-01": "Search-ADAccount -LockedOut",
  "m5-search-02": "Search-ADAccount -AccountDisabled -UsersOnly",
  "m5-search-03": "Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly",
  // M6 — Audit privilégiés
  "m6-audit-01": "Get-ADGroupMember -Identity \"Domain Admins\"",
  "m6-audit-02":
    "Get-ADUser -Filter * -Properties PasswordNeverExpires | Where-Object { $_.PasswordNeverExpires -eq $true }",
};

const exos = loadAll();
let ok = 0;
let ko = 0;
const fails: string[] = [];
const missing: string[] = [];

for (const e of exos) {
  let cmd: string | null = null;
  if (e.type === "compare-state") {
    cmd = (e.solution as any).reference;
  } else if (e.type === "qcm") {
    cmd = (e.solution as any).bonneReponse;
  } else if (e.type === "audit") {
    cmd = (e.solution as any).bonnesReponses.join(",");
  } else if (e.type === "compare-output") {
    cmd = COMPARE_OUTPUT_CMDS[e.id] ?? null;
    if (!cmd) {
      missing.push(e.id);
      continue;
    }
  } else if (e.type === "syntax-match") {
    cmd = (e.solution as any).reference;
  }

  if (!cmd) {
    missing.push(e.id);
    continue;
  }
  const v = validate({ exercise: e, command: cmd });
  if (v.ok) {
    ok++;
  } else {
    ko++;
    fails.push(
      `${e.id} [${e.type}]: ${v.message} | attendu=${(v as any).attendu ?? ""} | obtenu=${(v as any).obtenu ?? ""}`,
    );
  }
}

console.log(`\nTotal exos : ${exos.length}`);
console.log(`✓ OK : ${ok}`);
console.log(`✗ KO : ${ko}`);
console.log(`? Sans commande canonique : ${missing.length}`);

if (fails.length > 0) {
  console.log("\nÉchecs :");
  fails.forEach((f) => console.log("  - " + f));
}
if (missing.length > 0) {
  console.log("\nCompare-output sans commande canonique :");
  missing.forEach((m) => console.log("  - " + m));
}
if (ko > 0 || missing.length > 0) {
  process.exit(1);
}
