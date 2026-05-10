import { tokenize, type Token } from "./tokenizer";
import type { Command, Expr, Param, Pipeline, Script, ScriptBlock } from "./ast";

export class ParseError extends Error {
  constructor(message: string, public pos: number) {
    super(message);
  }
}

export function parsePipeline(src: string): Pipeline {
  const p = new Parser(tokenize(src));
  return p.pipeline();
}

export function parseScript(src: string): Script {
  const p = new Parser(tokenize(src));
  return p.script();
}

class Parser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  private peek(off = 0): Token {
    return this.tokens[this.i + off] ?? this.tokens[this.tokens.length - 1];
  }
  private consume(): Token {
    return this.tokens[this.i++];
  }
  private skipNewlines() {
    while (this.peek().type === "newline" || this.peek().type === "semi") {
      this.i++;
    }
  }

  pipeline(): Pipeline {
    this.skipNewlines();
    const stages: Command[] = [this.command()];
    while (this.peek().type === "pipe") {
      this.consume();
      this.skipNewlines();
      stages.push(this.command());
    }
    this.skipNewlines();
    if (this.peek().type !== "eof") {
      throw new ParseError(
        `inattendu : '${this.peek().value}'`,
        this.peek().pos,
      );
    }
    return { stages };
  }

  // Un script = une suite de pipelines séparés par newline/semicolon.
  script(): Script {
    const pipelines: Pipeline[] = [];
    this.skipNewlines();
    while (this.peek().type !== "eof") {
      const stages: Command[] = [this.command()];
      while (this.peek().type === "pipe") {
        this.consume();
        this.skipNewlines();
        stages.push(this.command());
      }
      pipelines.push({ stages });
      this.skipNewlines();
    }
    return { pipelines };
  }

  private command(): Command {
    const head = this.peek();
    if (head.type !== "ident") {
      throw new ParseError(
        `nom de commande attendu, vu '${head.value}'`,
        head.pos,
      );
    }
    this.consume();
    const cmd: Command = { name: head.value, params: [], positional: [] };

    while (true) {
      const t = this.peek();
      if (
        t.type === "eof" ||
        t.type === "pipe" ||
        t.type === "newline" ||
        t.type === "semi" ||
        t.type === "rparen" ||
        t.type === "rbrace"
      ) {
        break;
      }
      if (t.type === "param") {
        this.consume();
        const param: Param = { name: t.value };
        const next = this.peek();
        // -Switch suivi d'un autre param/pipe/eof => switch sans valeur
        if (
          next.type !== "param" &&
          next.type !== "pipe" &&
          next.type !== "eof" &&
          next.type !== "newline" &&
          next.type !== "semi" &&
          next.type !== "rparen" &&
          next.type !== "rbrace" &&
          next.type !== "comma"
        ) {
          const first = this.expression();
          // Liste virgulée : -Properties Name, Mail, Title
          if (this.peek().type === "comma") {
            const items: Expr[] = [first];
            while (this.peek().type === "comma") {
              this.consume();
              items.push(this.expression());
            }
            param.value = { kind: "array", items };
          } else {
            param.value = first;
          }
        }
        cmd.params.push(param);
      } else if (t.type === "comma") {
        this.consume();
      } else {
        cmd.positional.push(this.expression());
      }
    }
    return cmd;
  }

  // expression supporte : littéral, scriptblock, array, property access,
  // et expressions binaires/comparaison à l'intérieur des scriptblocks.
  private expression(): Expr {
    return this.orExpr();
  }

  private orExpr(): Expr {
    let left = this.andExpr();
    while (this.peek().type === "op" && this.peek().value === "or") {
      const op = this.consume().value;
      const right = this.andExpr();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private andExpr(): Expr {
    let left = this.cmpExpr();
    while (this.peek().type === "op" && this.peek().value === "and") {
      const op = this.consume().value;
      const right = this.cmpExpr();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private cmpExpr(): Expr {
    if (this.peek().type === "op" && this.peek().value === "not") {
      this.consume();
      return { kind: "not", expr: this.cmpExpr() };
    }
    let left = this.primary();
    while (
      this.peek().type === "op" &&
      this.peek().value !== "and" &&
      this.peek().value !== "or"
    ) {
      const op = this.consume().value;
      const right = this.primary();
      left = { kind: "binary", op, left, right };
    }
    return left;
  }

  private primary(): Expr {
    const t = this.peek();
    if (t.type === "string") {
      this.consume();
      return { kind: "string", value: t.value };
    }
    if (t.type === "number") {
      this.consume();
      return { kind: "number", value: Number(t.value) };
    }
    if (t.type === "star") {
      this.consume();
      return { kind: "star" };
    }
    if (t.type === "dollar") {
      this.consume();
      return this.maybeProperty({ kind: "var", name: t.value });
    }
    if (t.type === "lbrace") {
      this.consume();
      const body = this.scriptblockBody();
      if (this.peek().type !== "rbrace") {
        throw new ParseError("'}' attendu", this.peek().pos);
      }
      this.consume();
      return { kind: "scriptblock", body };
    }
    if (t.type === "lparen") {
      this.consume();
      const inner = this.expression();
      if (this.peek().type !== "rparen") {
        throw new ParseError("')' attendu", this.peek().pos);
      }
      this.consume();
      return inner;
    }
    if (t.type === "ident") {
      this.consume();
      // Bareword : pour True/False on convertit, sinon string.
      const lower = t.value.toLowerCase();
      if (lower === "true" || lower === "$true") {
        return { kind: "bool", value: true };
      }
      if (lower === "false" || lower === "$false") {
        return { kind: "bool", value: false };
      }
      return this.maybeProperty({ kind: "ident", value: t.value });
    }
    throw new ParseError(`expression attendue, vu '${t.value}'`, t.pos);
  }

  private maybeProperty(target: Expr): Expr {
    let cur = target;
    while (this.peek().type === "dot") {
      this.consume();
      const id = this.peek();
      if (id.type !== "ident") {
        throw new ParseError("nom de propriété attendu", id.pos);
      }
      this.consume();
      cur = { kind: "property", target: cur, name: id.value };
    }
    return cur;
  }

  private scriptblockBody(): ScriptBlock {
    // On supporte une seule expression booléenne dans le scriptblock.
    this.skipNewlines();
    const expr = this.expression();
    this.skipNewlines();
    return { expr };
  }
}
