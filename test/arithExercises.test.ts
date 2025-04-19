// filepath: /Users/ozawa/Desktop/sample/typeSystem/deno/test/arithExercises.test.ts
import { assertEquals } from "https://deno.land/std@0.215.0/assert/mod.ts";
import { TinyTsParser } from "@/index.ts";
import { typecheck } from "@src/arithExercises.ts";

function assertThrowsString(fn: () => unknown, expectedMessage: string) {
  let thrown = false;
  let actualMessage = "";

  try {
    fn();
  } catch (e) {
    thrown = true;
    actualMessage = String(e);
  }

  if (!thrown) {
    throw new Error(
      `例外がスローされませんでした。期待していた例外: "${expectedMessage}"`
    );
  }

  if (actualMessage !== expectedMessage) {
    throw new Error(
      `期待していた例外 "${expectedMessage}" と異なる例外 "${actualMessage}" がスローされました`
    );
  }
}

// 正常系テスト
Deno.test("typecheck - true literal", () => {
  const result = typecheck(TinyTsParser.parseArith("true"));
  assertEquals(result.tag, "Boolean");
});

Deno.test("typecheck - false literal", () => {
  const result = typecheck(TinyTsParser.parseArith("false"));
  assertEquals(result.tag, "Boolean");
});

Deno.test("typecheck - number literal", () => {
  const result = typecheck(TinyTsParser.parseArith("42"));
  assertEquals(result.tag, "Number");
});

Deno.test("typecheck - addition of numbers", () => {
  const result = typecheck(TinyTsParser.parseArith("1 + 2"));
  assertEquals(result.tag, "Number");
});

Deno.test("typecheck - nested addition", () => {
  const result = typecheck(TinyTsParser.parseArith("1 + (2 + 3)"));
  assertEquals(result.tag, "Number");
});

Deno.test("typecheck - if statement with number results", () => {
  const result = typecheck(TinyTsParser.parseArith("(true ? 1 : 2)"));
  assertEquals(result.tag, "Number");
});

Deno.test("typecheck - if statement with boolean results", () => {
  const result = typecheck(TinyTsParser.parseArith("(false ? true : false)"));
  assertEquals(result.tag, "Boolean");
});

Deno.test("typecheck - if statement with number condition", () => {
  const result = typecheck(TinyTsParser.parseArith("(1 ? true : false)"));
  assertEquals(result.tag, "Boolean");
});

// エラー系テスト
Deno.test("typecheck - error on adding boolean", () => {
  assertThrowsString(
    () => typecheck(TinyTsParser.parseArith("1 + true")),
    "number expected"
  );
});

Deno.test("typecheck - error on branch type mismatch", () => {
  assertThrowsString(
    () => typecheck(TinyTsParser.parseArith("(true ? 1 : true)")),
    "then and else have different types"
  );
});

Deno.test("typecheck - error on invalid expression in condition", () => {
  assertThrowsString(
    () => typecheck(TinyTsParser.parseArith("((1 + true) ? true : false)")),
    "number expected"
  );
});
