import type { Expr } from "../ast";

export function paramMap(params: { name: string; value?: Expr }[]) {
  const m = new Map<string, Expr>();
  for (const p of params) if (p.value) m.set(p.name, p.value);
  return m;
}

export function hasSwitch(
  params: { name: string; value?: Expr }[],
  name: string,
): boolean {
  return params.some(
    (p) => p.name.toLowerCase() === name.toLowerCase() && p.value === undefined,
  );
}

export function stringy(e: Expr | undefined): string | null {
  if (!e) return null;
  if (e.kind === "string" || e.kind === "ident") return e.value;
  return null;
}

export function readBool(e: Expr | undefined): boolean | null {
  if (!e) return null;
  if (e.kind === "bool") return e.value;
  return null;
}

export function readList(e: Expr | undefined): string[] | undefined {
  if (!e) return undefined;
  const s = stringy(e);
  if (s !== null) return [s];
  if (e.kind === "array") {
    return e.items.map(stringy).filter((x): x is string => x !== null);
  }
  return undefined;
}
