// Tokenizer PowerShell minimaliste (sous-ensemble support adbaby).
// Couvre : identifiants, paramètres -Name, strings 'simple' et "double",
// nombres, pipe |, séparateurs , ; ( ) { } [ ], commentaires #...
//
// Volontairement étroit : on n'essaie pas de simuler PowerShell complet,
// juste les formes vues dans les annales E7 et les supports ANSSI.

export type TokenType =
  | "ident" // Get-ADUser, alice, Sales
  | "param" // -Identity, -Filter
  | "string" // 'foo' | "foo"
  | "number"
  | "pipe" // |
  | "comma"
  | "semi"
  | "lparen"
  | "rparen"
  | "lbrace"
  | "rbrace"
  | "lbracket"
  | "rbracket"
  | "star" // *
  | "dollar" // $_
  | "dot" // .Property
  | "op" // -eq, -like, -gt, ... pour scriptblocks Filter
  | "assign" // =
  | "newline"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const COMPARISON_OPS = new Set([
  "eq",
  "ne",
  "lt",
  "le",
  "gt",
  "ge",
  "like",
  "notlike",
  "match",
  "notmatch",
  "in",
  "notin",
  "and",
  "or",
  "not",
  "contains",
  "notcontains",
]);

export function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];

    if (c === "#") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      out.push({ type: "newline", value: "\n", pos: i });
      i++;
      continue;
    }

    if (c === "|") {
      out.push({ type: "pipe", value: "|", pos: i });
      i++;
      continue;
    }
    if (c === ",") {
      out.push({ type: "comma", value: ",", pos: i });
      i++;
      continue;
    }
    if (c === ";") {
      out.push({ type: "semi", value: ";", pos: i });
      i++;
      continue;
    }
    if (c === "(") {
      out.push({ type: "lparen", value: "(", pos: i });
      i++;
      continue;
    }
    if (c === ")") {
      out.push({ type: "rparen", value: ")", pos: i });
      i++;
      continue;
    }
    if (c === "{") {
      out.push({ type: "lbrace", value: "{", pos: i });
      i++;
      continue;
    }
    if (c === "}") {
      out.push({ type: "rbrace", value: "}", pos: i });
      i++;
      continue;
    }
    if (c === "[") {
      out.push({ type: "lbracket", value: "[", pos: i });
      i++;
      continue;
    }
    if (c === "]") {
      out.push({ type: "rbracket", value: "]", pos: i });
      i++;
      continue;
    }
    if (c === "*") {
      out.push({ type: "star", value: "*", pos: i });
      i++;
      continue;
    }
    if (c === "=") {
      out.push({ type: "assign", value: "=", pos: i });
      i++;
      continue;
    }
    if (c === ".") {
      out.push({ type: "dot", value: ".", pos: i });
      i++;
      continue;
    }

    if (c === "$") {
      const start = i;
      i++;
      while (i < n && /[\w_]/.test(src[i])) i++;
      out.push({ type: "dollar", value: src.slice(start, i), pos: start });
      continue;
    }

    if (c === "'" || c === '"') {
      const quote = c;
      const start = i;
      i++;
      let s = "";
      while (i < n && src[i] !== quote) {
        // Échappement basique : `n -> \n, `t -> \t, `` -> `
        if (src[i] === "`" && i + 1 < n) {
          const nx = src[i + 1];
          if (nx === "n") s += "\n";
          else if (nx === "t") s += "\t";
          else s += nx;
          i += 2;
          continue;
        }
        s += src[i];
        i++;
      }
      if (i < n) i++; // consommer la quote fermante
      out.push({ type: "string", value: s, pos: start });
      continue;
    }

    if (/[0-9]/.test(c)) {
      const start = i;
      while (i < n && /[0-9]/.test(src[i])) i++;
      out.push({ type: "number", value: src.slice(start, i), pos: start });
      continue;
    }

    if (c === "-") {
      // Peut être : paramètre -Name, ou opérateur -eq/-like/-gt/etc.
      const start = i;
      i++;
      let s = "";
      while (i < n && /[A-Za-z]/.test(src[i])) {
        s += src[i];
        i++;
      }
      if (s.length === 0) {
        // signe moins isolé : on tokenize comme ident pour l'instant
        out.push({ type: "ident", value: "-", pos: start });
        continue;
      }
      if (COMPARISON_OPS.has(s.toLowerCase())) {
        out.push({ type: "op", value: s.toLowerCase(), pos: start });
      } else {
        out.push({ type: "param", value: s, pos: start });
      }
      continue;
    }

    if (/[A-Za-z_]/.test(c)) {
      const start = i;
      // Les barewords PowerShell peuvent contenir des points (samAccountName
      // type `j.dupont`). On accepte `.` à condition qu'il sépare deux blocs
      // alphanumériques — sinon c'est l'opérateur d'accès propriété.
      while (i < n) {
        const ch = src[i];
        if (/[A-Za-z0-9_\-]/.test(ch)) {
          i++;
          continue;
        }
        if (ch === "." && i + 1 < n && /[A-Za-z0-9_]/.test(src[i + 1])) {
          i++;
          continue;
        }
        break;
      }
      const value = src.slice(start, i);
      out.push({ type: "ident", value, pos: start });
      continue;
    }

    // Caractère inconnu : on l'avale en tant qu'ident pour ne pas crasher.
    out.push({ type: "ident", value: c, pos: i });
    i++;
  }

  out.push({ type: "eof", value: "", pos: n });
  return out;
}
