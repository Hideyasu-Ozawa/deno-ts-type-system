import { TinyTsParser } from "@/index.ts";

export type Type =
  | { tag: "Boolean" }
  | { tag: "Number" }
  | { tag: "Func"; params: Param[]; retType: Type };
export type Param = { name: string; type: Type };
export type TypeEnv = Record<string, Type>;

export type Term =
  | { tag: "true" }
  | { tag: "false" }
  | { tag: "if"; cond: Term; thn: Term; els: Term }
  | { tag: "number"; n: number }
  | { tag: "add"; left: Term; right: Term }
  | { tag: "var"; name: string }
  | { tag: "func"; params: Param[]; body: Term }
  | { tag: "call"; func: Term; args: Term[] }
  | { tag: "seq"; body: Term[]; rest: Term }
  | { tag: "const"; name: string; init: Term; rest: Term };

function typeEq(ty1: Type, ty2: Type): boolean {
  switch (ty2.tag) {
    case "Boolean":
      return ty1.tag === "Boolean";
    case "Number":
      return ty1.tag === "Number";
    case "Func":
      if (ty1.tag !== "Func") return false;
      if (ty1.params.length !== ty2.params.length) return false;
      for (let i = 0; i < ty1.params.length; i++) {
        if (!typeEq(ty1.params[i].type, ty2.params[i].type)) return false;
      }
      return typeEq(ty1.retType, ty2.retType);
  }
}

export function typecheck(t: Term, tyEnv: TypeEnv): Type {
  switch (t.tag) {
    case "true":
      return { tag: "Boolean" };
    case "false":
      return { tag: "Boolean" };
    case "if": {
      const condTy = typecheck(t.cond, tyEnv);
      if (condTy.tag !== "Boolean") throw "boolean expected";
      const thnTy = typecheck(t.thn, tyEnv);
      const elsTy = typecheck(t.els, tyEnv);
      if (!typeEq(thnTy, elsTy)) {
        throw "then and else have different types";
      }
      return thnTy;
    }
    case "number":
      return { tag: "Number" };
    case "add": {
      const leftTy = typecheck(t.left, tyEnv);
      if (leftTy.tag !== "Number") throw "number expected";
      const rightTy = typecheck(t.right, tyEnv);
      if (rightTy.tag !== "Number") throw "number expected";
      return { tag: "Number" };
    }
    case "var": {
      // console.log("tyEnv in var", tyEnv);
      if (tyEnv[t.name] === undefined) {
        throw new Error(`unknown variable: ${t.name}`);
      }
      return tyEnv[t.name];
    }
    case "func": {
      const newTyEnv = { ...tyEnv };
      // console.log("tyEnv", tyEnv);
      for (const { name, type } of t.params) {
        newTyEnv[name] = type;
        // tyEnv[name] = type;
        // console.log("tyEnv", tyEnv);
      }
      const retType = typecheck(t.body, newTyEnv);
      // const retType = typecheck(t.body, tyEnv);
      return { tag: "Func", params: t.params, retType };
    }
    case "call": {
      const funcTy = typecheck(t.func, tyEnv);
      if (funcTy.tag !== "Func") {
        throw new Error("function type expected");
      }
      if (funcTy.params.length !== t.args.length) {
        throw new Error("wrong number of arguments");
      }
      for (let i = 0; i < t.args.length; i++) {
        const argTy = typecheck(t.args[i], tyEnv);
        if (!typeEq(argTy, funcTy.params[i].type)) {
          throw new Error("argument type mismatch");
        }
      }
      return funcTy.retType;
    }
    default:
      throw new Error("not implemented yet");
  }
}

// const node = TinyTsParser.parseBasic("(f: (x: number) => number) => 1");
// console.dir(node, { depth: null });

// console.log(typecheck(TinyTsParser.parseBasic("(x: boolean) => 42"), {}));
// console.log(typecheck(TinyTsParser.parseBasic("(x: number) => x"), {}));
// console.log(typecheck(TinyTsParser.parseBasic("( (x: number) => x )(42)"), {})); // { tag: "Number" }
// console.log(
//   typecheck(TinyTsParser.parseBasic("( (x: number) => x )(true)"), {})
// );
// console.log(typecheck(TinyTsParser.parseBasic("(x: number) => y"), {}));
// console.log(
//   typecheck(TinyTsParser.parseBasic("( (x: number) => 42)(1,2,3)"), {})
// );
// console.dir(
//   typecheck(TinyTsParser.parseBasic("(f: (x: number) => number) => 1"), {}),
//   { depth: null }
// );
// console.log(TinyTsParser.parseBasic("( (x: number) => 1)(x)"), {});
// case "func"の中でtyEnvを更新している
// のちのcase "var"の中で更新されたtyEnvの存在すべきでない{ x: { tag: "Number" } }を見てしまう
console.log(typecheck(TinyTsParser.parseBasic("( (x: number) => 1)(x)"), {}));
