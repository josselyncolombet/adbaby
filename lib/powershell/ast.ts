// AST PowerShell : juste ce dont on a besoin pour adbaby.

export type Expr =
  | { kind: "string"; value: string }
  | { kind: "number"; value: number }
  | { kind: "bool"; value: boolean }
  | { kind: "star" }
  | { kind: "ident"; value: string } // bareword (ex. samAccountName)
  | { kind: "var"; name: string } // $_ ou $foo
  | { kind: "array"; items: Expr[] }
  | { kind: "scriptblock"; body: ScriptBlock }
  | { kind: "property"; target: Expr; name: string } // $_.Name
  | { kind: "binary"; op: string; left: Expr; right: Expr }
  | { kind: "not"; expr: Expr };

export interface ScriptBlock {
  // Pour -Filter et Where-Object on ne supporte qu'une expression
  // booléenne, pas un vrai script multi-statement.
  expr: Expr;
}

export interface Param {
  name: string; // sans le tiret
  value?: Expr; // absent => switch (-Force, -Recursive)
}

export interface Command {
  name: string; // ex. "Get-ADUser"
  params: Param[]; // params nommés -Name value
  positional: Expr[]; // valeurs positionnelles
}

export interface Pipeline {
  stages: Command[];
}

export interface Script {
  pipelines: Pipeline[];
}
