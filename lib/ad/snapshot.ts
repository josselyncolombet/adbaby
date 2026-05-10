import type { ADSnapshot } from "./types";

// Clone profond d'une snapshot. Sert avant chaque exécution :
// l'élève peut "casser" l'état sans polluer l'état suivant.
export function cloneSnapshot(s: ADSnapshot): ADSnapshot {
  return JSON.parse(JSON.stringify(s));
}

// Sérialisation canonique (clés triées) — utile pour comparer un état
// final attendu à l'état réel après exécution dans les exos compare-state.
export function canonicalize(s: ADSnapshot): string {
  return JSON.stringify(sortKeys(s));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      out[k] = sortKeys(obj[k]);
    }
    return out;
  }
  return value;
}
