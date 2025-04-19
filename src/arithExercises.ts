// import { TinyTsParser } from "@/index.ts";

export type Type = { tag: "Boolean" } | { tag: "Number" };

export type Term =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: Term; thn: Term; els: Term }
  | { tag: "number"; n: number }
  | { tag: "add"; left: Term; right: Term };

export function typecheck(t: Term): Type {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      typecheck(t.cond);
      const thnTy = typecheck(t.thn);
      const elsTy = typecheck(t.els);
      if (thnTy.tag !== elsTy.tag) {
        throw "then and else have different types";
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = typecheck(t.left);
      if (leftTy.tag !== "Number") throw "number expected";
      const rightTy = typecheck(t.right);
      if (rightTy.tag !== "Number") throw "number expected";
      return { tag: "Number" };
    }
  }
}

// console.log(typecheck(TinyTsParser.parseArith("1 + 2"))); // { tag: "Number" }
// console.log(typecheck(TinyTsParser.parseArith("1 + true"))); // Uncaught (in promise) "number expected"
// console.log(typecheck(TinyTsParser.parseArith("true"))); // { tag: "Boolean" }
// console.log(typecheck(TinyTsParser.parseArith("false"))); // { tag: "Boolean" }
