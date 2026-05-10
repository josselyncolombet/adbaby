import { test } from "node:test";
import { strict as assert } from "node:assert";
import { cloneSnapshot, canonicalize } from "./snapshot";
import type { ADSnapshot } from "./types";

const tiny: ADSnapshot = {
  domain: { name: "x.local", dn: "DC=x,DC=local", netbios: "X" },
  ous: [],
  users: [
    {
      samAccountName: "alice",
      name: "Alice",
      dn: "CN=Alice,DC=x,DC=local",
      parentDn: "DC=x,DC=local",
      enabled: true,
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

test("cloneSnapshot returns deep copy", () => {
  const c = cloneSnapshot(tiny);
  c.users[0].enabled = false;
  assert.equal(tiny.users[0].enabled, true);
});

test("canonicalize produces stable order", () => {
  const a = canonicalize(tiny);
  const reordered: ADSnapshot = {
    ...tiny,
    users: tiny.users.map((u) => ({ ...u })),
  };
  const b = canonicalize(reordered);
  assert.equal(a, b);
});
