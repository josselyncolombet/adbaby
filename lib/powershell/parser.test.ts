import { test } from "node:test";
import { strict as assert } from "node:assert";
import { parsePipeline } from "./parser";

test("parses Get-ADUser -Identity alice", () => {
  const p = parsePipeline("Get-ADUser -Identity alice");
  assert.equal(p.stages.length, 1);
  assert.equal(p.stages[0].name, "Get-ADUser");
  assert.equal(p.stages[0].params[0].name, "Identity");
  assert.deepEqual(p.stages[0].params[0].value, {
    kind: "ident",
    value: "alice",
  });
});

test("parses pipeline Get-ADUser | Where-Object", () => {
  const p = parsePipeline(
    "Get-ADUser -Filter * | Where-Object { $_.Enabled -eq $false }",
  );
  assert.equal(p.stages.length, 2);
  assert.equal(p.stages[1].name, "Where-Object");
  // Le Where-Object reçoit un scriptblock positionnel
  assert.equal(p.stages[1].positional[0].kind, "scriptblock");
});

test("parses -Filter scriptblock with -like", () => {
  const p = parsePipeline(
    'Get-ADUser -Filter { samAccountName -like "a*" }',
  );
  const filter = p.stages[0].params[0].value!;
  assert.equal(filter.kind, "scriptblock");
});

test("parses -Properties with comma list", () => {
  const p = parsePipeline(
    "Get-ADUser -Identity alice -Properties LastLogonDate, PasswordLastSet",
  );
  const props = p.stages[0].params.find((x) => x.name === "Properties");
  assert.ok(props);
});

test("supports -Filter * star", () => {
  const p = parsePipeline("Get-ADUser -Filter *");
  const f = p.stages[0].params.find((x) => x.name === "Filter");
  assert.equal(f?.value?.kind, "star");
});

test("dotted bareword like j.dupont stays one ident", () => {
  const p = parsePipeline("Get-ADUser -Identity j.dupont");
  assert.deepEqual(p.stages[0].params[0].value, {
    kind: "ident",
    value: "j.dupont",
  });
});

test("$_.Enabled still parses as property access", () => {
  const p = parsePipeline("Get-ADUser -Filter * | Where-Object { $_.Enabled -eq $false }");
  const sb = p.stages[1].positional[0];
  assert.equal(sb.kind, "scriptblock");
});
