import { test } from "node:test";
import { strict as assert } from "node:assert";
import { execute } from "./executor";
import type { ADSnapshot } from "../ad/types";

const snap: ADSnapshot = {
  domain: { name: "x.local", dn: "DC=x,DC=local", netbios: "X" },
  ous: [
    {
      name: "Sales",
      dn: "OU=Sales,DC=x,DC=local",
      parentDn: "DC=x,DC=local",
    },
  ],
  users: [
    {
      samAccountName: "alice",
      name: "Alice Martin",
      dn: "CN=Alice Martin,OU=Sales,DC=x,DC=local",
      parentDn: "OU=Sales,DC=x,DC=local",
      enabled: true,
      locked: false,
      passwordNeverExpires: false,
      memberOf: [],
    },
    {
      samAccountName: "bob",
      name: "Bob Durand",
      dn: "CN=Bob Durand,OU=Sales,DC=x,DC=local",
      parentDn: "OU=Sales,DC=x,DC=local",
      enabled: false,
      locked: false,
      passwordNeverExpires: false,
      memberOf: [],
    },
  ],
  groups: [],
  computers: [],
  defaultPasswordPolicy: {
    minPasswordLength: 8,
    passwordHistoryCount: 5,
    maxPasswordAge: 90,
    minPasswordAge: 1,
    complexityEnabled: true,
    reversibleEncryptionEnabled: false,
    lockoutThreshold: 0,
    lockoutDuration: 30,
    lockoutObservationWindow: 30,
  },
  now: "2026-01-01T00:00:00Z",
};

test("Get-ADUser -Identity returns one user", () => {
  const r = execute("Get-ADUser -Identity alice", snap);
  assert.equal(r.errors.length, 0);
  assert.equal(r.output.length, 1);
  assert.equal(r.output[0].props?.SamAccountName, "alice");
});

test("Get-ADUser unknown throws helpful error", () => {
  const r = execute("Get-ADUser -Identity ghost", snap);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /ghost/);
});

test("Get-ADUser -Filter * returns all users", () => {
  const r = execute("Get-ADUser -Filter *", snap);
  assert.equal(r.output.length, 2);
});

test("Filter on Enabled $false returns disabled users", () => {
  const r = execute("Get-ADUser -Filter { Enabled -eq $false }", snap);
  assert.equal(r.output.length, 1);
  assert.equal(r.output[0].props?.SamAccountName, "bob");
});

test("Pipeline with Where-Object filters", () => {
  const r = execute(
    "Get-ADUser -Filter * | Where-Object { $_.Enabled -eq $true }",
    snap,
  );
  assert.equal(r.output.length, 1);
  assert.equal(r.output[0].props?.SamAccountName, "alice");
});

test("Measure-Object returns count", () => {
  const r = execute("Get-ADUser -Filter * | Measure-Object", snap);
  assert.equal(r.output[0].props?.Count, 2);
});

test("Sort-Object sorts on Name desc", () => {
  const r = execute(
    "Get-ADUser -Filter * | Sort-Object Name -Descending",
    snap,
  );
  assert.equal(r.output[0].props?.SamAccountName, "bob");
});

test("Select-Object Property keeps only those", () => {
  const r = execute(
    "Get-ADUser -Identity alice | Select-Object Name, SamAccountName",
    snap,
  );
  const props = r.output[0].props!;
  assert.deepEqual(Object.keys(props).sort(), ["Name", "SamAccountName"]);
});
