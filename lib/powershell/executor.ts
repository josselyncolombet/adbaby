import type { ADSnapshot } from "../ad/types";
import type { Command, Expr, Pipeline } from "./ast";
import { cloneSnapshot } from "../ad/snapshot";
import type { PSValue } from "./value";
import { getProp } from "./value";
import { CMDLETS } from "./cmdlets";
import { formatOutput, stringify } from "./format";

export interface ExecResult {
  output: PSValue[]; // objets renvoyés par le pipeline (pour le rendu)
  text: string; // sortie formatée type console (Format-Table par défaut)
  errors: string[]; // erreurs runtime
  finalState: ADSnapshot; // état AD après exécution (pour compare-state)
}

export class RuntimeError extends Error {}

export interface ExecContext {
  state: ADSnapshot;
  errors: string[];
}

export function execute(src: string, snapshot: ADSnapshot): ExecResult {
  // Import en local pour éviter le cycle parser <-> executor à l'init
  const { parsePipeline } = require("./parser") as typeof import("./parser");
  const ctx: ExecContext = {
    state: cloneSnapshot(snapshot),
    errors: [],
  };
  let output: PSValue[] = [];
  let text = "";
  try {
    const { parseScript } = require("./parser") as typeof import("./parser");
    const script = parseScript(src);
    let pipe: PSValue[] = [];
    for (const pipeline of script.pipelines) {
      pipe = [];
      for (const stage of pipeline.stages) {
        const cmdlet = CMDLETS[stage.name.toLowerCase()];
        if (!cmdlet) {
          throw new RuntimeError(
            `commande inconnue : '${stage.name}'. Cmdlets supportées : ${Object.keys(
              CMDLETS,
            )
              .sort()
              .join(", ")}`,
          );
        }
        pipe = cmdlet({ ctx, command: stage, input: pipe });
      }
    }
    output = pipe;
    text = formatOutput(output);
  } catch (e) {
    if (e instanceof Error) ctx.errors.push(e.message);
    else ctx.errors.push(String(e));
  }
  return {
    output,
    text,
    errors: ctx.errors,
    finalState: ctx.state,
  };
}

export { stringify };

// Évalue une expression dans un contexte (utilisé par -Filter et Where-Object).
// `current` est l'objet courant ($_) le cas échéant.
export function evalExpr(
  expr: Expr,
  current: PSValue | undefined,
): unknown {
  switch (expr.kind) {
    case "string":
      return expr.value;
    case "number":
      return expr.value;
    case "bool":
      return expr.value;
    case "star":
      return "*";
    case "var": {
      if (expr.name === "$_" || expr.name === "$PSItem") return current;
      if (expr.name === "$true") return true;
      if (expr.name === "$false") return false;
      if (expr.name === "$null") return null;
      return undefined;
    }
    case "ident":
      // Dans un scriptblock -Filter sans $_ : "samAccountName -eq 'x'"
      // Le côté gauche est traité comme propriété de $_
      if (current) return getProp(current, expr.value);
      return expr.value;
    case "property": {
      const t = evalExpr(expr.target, current);
      if (t && typeof t === "object" && "props" in (t as object)) {
        return getProp(t as PSValue, expr.name);
      }
      if (t && typeof t === "object") {
        return (t as Record<string, unknown>)[expr.name];
      }
      return undefined;
    }
    case "array":
      return expr.items.map((e) => evalExpr(e, current));
    case "scriptblock":
      return expr;
    case "not":
      return !truthy(evalExpr(expr.expr, current));
    case "binary": {
      const l = evalExpr(expr.left, current);
      const r = evalExpr(expr.right, current);
      return applyOp(expr.op, l, r);
    }
  }
}

function truthy(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function applyOp(op: string, l: unknown, r: unknown): unknown {
  switch (op) {
    case "eq":
      return looseEq(l, r);
    case "ne":
      return !looseEq(l, r);
    case "lt":
      return compareNum(l, r) < 0;
    case "le":
      return compareNum(l, r) <= 0;
    case "gt":
      return compareNum(l, r) > 0;
    case "ge":
      return compareNum(l, r) >= 0;
    case "like":
      return likeMatch(String(l ?? ""), String(r ?? ""));
    case "notlike":
      return !likeMatch(String(l ?? ""), String(r ?? ""));
    case "match":
      return new RegExp(String(r ?? "")).test(String(l ?? ""));
    case "notmatch":
      return !new RegExp(String(r ?? "")).test(String(l ?? ""));
    case "contains":
      return Array.isArray(l) && l.some((x) => looseEq(x, r));
    case "notcontains":
      return !(Array.isArray(l) && l.some((x) => looseEq(x, r)));
    case "in":
      return Array.isArray(r) && (r as unknown[]).some((x) => looseEq(x, l));
    case "notin":
      return !(Array.isArray(r) && (r as unknown[]).some((x) => looseEq(x, l)));
    case "and":
      return truthy(l) && truthy(r);
    case "or":
      return truthy(l) || truthy(r);
  }
  throw new RuntimeError(`opérateur non supporté : -${op}`);
}

function looseEq(a: unknown, b: unknown): boolean {
  if (typeof a === "string" && typeof b === "string") {
    return a.toLowerCase() === b.toLowerCase();
  }
  return a === b;
}

function compareNum(a: unknown, b: unknown): number {
  const x = typeof a === "number" ? a : Date.parse(String(a ?? "")) || NaN;
  const y = typeof b === "number" ? b : Date.parse(String(b ?? "")) || NaN;
  if (Number.isFinite(x) && Number.isFinite(y)) return x - y;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

function likeMatch(s: string, pattern: string): boolean {
  // Pattern PowerShell : * et ?
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i").test(s);
}
