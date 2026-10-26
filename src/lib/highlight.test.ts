// Tests for the syntax highlighter. Run with `npm run test:unit`.
// Each case lists only the pieces that are NOT plain, in order, so what the
// test says is what a learner sees: bold keywords, colored literals, italic comments.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CODE_LANGUAGES } from "./examples.ts";
import { highlight, roleOf, type TokenKind } from "./highlight.ts";

type Language = keyof typeof CODE_LANGUAGES;

async function marked(code: string, language: Language): Promise<Array<[TokenKind, string]>> {
  const lines = await highlight(code, language);
  return lines.flat().filter((token) => token.kind !== "plain").map((token) => [token.kind, token.text]);
}

test("C: directives, types, numbers with suffixes, strings with escapes, comments", async () => {
  const code = [
    "#include <stdio.h>",
    "int main(void) { // start",
    '    float f = 1.5f; char c = \'a\'; printf("Total: %d\\n", 1 + 2);',
    "    return 0; /* done */",
    "}",
  ].join("\n");
  assert.deepEqual(await marked(code, "c"), [
    ["keyword", "#include"],
    ["literal", "<stdio.h>"],
    ["keyword", "int"],
    ["keyword", "void"],
    ["comment", "// start"],
    ["keyword", "float"],
    ["literal", "1.5f"],
    ["keyword", "char"],
    ["literal", "'a'"],
    ["literal", '"Total: %d\\n"'],
    ["literal", "1"],
    ["literal", "2"],
    ["keyword", "return"],
    ["literal", "0"],
    ["comment", "/* done */"],
  ]);
});

test("C++: new is a keyword, symbols are not, raw strings are one literal", async () => {
  const code = ['auto p = new int(3); bool ok = true && !false;', 'std::cout << R"(say "hi")" << std::endl;'].join("\n");
  assert.deepEqual(await marked(code, "cpp"), [
    ["keyword", "auto"],
    ["keyword", "new"],
    ["keyword", "int"],
    ["literal", "3"],
    ["keyword", "bool"],
    ["keyword", "true"],
    ["keyword", "false"],
    ["literal", 'R"(say "hi")"'],
  ]);
});

test("Java: type names are not keywords, instanceof and new are, Javadoc tags stay comments, text blocks are literals", async () => {
  const code = [
    "/** Adds. @param a first */",
    "public class Hello {",
    '    String t = """',
    '        block""";',
    "    void m(Object o) { if (o instanceof String) { o = new Object(); } }",
    "}",
  ].join("\n");
  assert.deepEqual(await marked(code, "java"), [
    ["comment", "/** Adds. @param a first */"],
    ["keyword", "public"],
    ["keyword", "class"],
    ["literal", '"""'],
    ["literal", 'block"""'],
    ["keyword", "void"],
    ["keyword", "if"],
    ["keyword", "instanceof"],
    ["keyword", "new"],
  ]);
});

test("Java: import is a keyword but the imported name is not", async () => {
  assert.deepEqual(await marked("import java.util.List;", "java"), [["keyword", "import"]]);
});

test("Python: f-string prefix and hex prefix are literals, # inside a string is not a comment, and/not/None are keywords", async () => {
  const code = [
    "def greet(name):",
    '    """Say hi."""',
    '    return f"Hi {name + 1}" if name and not None else "a # b"  # note',
    "print(0x1F, True)",
  ].join("\n");
  assert.deepEqual(await marked(code, "python"), [
    ["keyword", "def"],
    ["literal", '"""Say hi."""'],
    ["keyword", "return"],
    ["literal", 'f"Hi {'],
    ["literal", '1}"'],
    ["keyword", "if"],
    ["keyword", "and"],
    ["keyword", "not"],
    ["keyword", "None"],
    ["keyword", "else"],
    ["literal", '"a # b"'],
    ["comment", "# note"],
    ["literal", "0x1F"],
    ["keyword", "True"],
  ]);
});

test("roleOf: a comment beats keywords inside it, literals beat keyword prefixes, symbols stay plain", () => {
  assert.equal(roleOf(["comment.block.javadoc.java", "keyword.other.documentation.javadoc.java"], "@param"), "comment");
  assert.equal(roleOf(["string.quoted.single.python", "storage.type.string.python"], "f"), "literal");
  assert.equal(roleOf(["keyword.operator.arithmetic.c"], "+"), "plain");
  assert.equal(roleOf(["keyword.operator.logical.python"], "and"), "keyword");
  assert.equal(roleOf(["storage.type.java"], "String"), "plain");
  assert.equal(roleOf(["storage.type.function.arrow.java"], "->"), "plain");
  assert.equal(roleOf([], "   "), "plain");
});

test("every line keeps its exact text, including blank lines, indentation and tabs", async () => {
  const code = ["def f():", "", "\treturn 1", "    ", "# end"].join("\n");
  const lines = await highlight(code, "python");
  assert.equal(lines.length, 5);
  assert.deepEqual(
    lines.map((tokens) => tokens.map((token) => token.text).join("")),
    code.split("\n"),
  );
  assert.ok(lines.every((tokens) => tokens.length >= 1));
});

test("the real example files highlight without error and rebuild exactly", async () => {
  for (const [language, { extension }] of Object.entries(CODE_LANGUAGES) as Array<[Language, { extension: string }]>) {
    const file = language === "java" ? "Hello" : "hello";
    const code = readFileSync(`content/examples/${language}/${file}${extension}`, "utf8").replace(/\n$/, "");
    const lines = await highlight(code, language);
    assert.equal(lines.map((tokens) => tokens.map((t) => t.text).join("")).join("\n"), code, `${language} example`);
  }
});

test("an unknown language fails loudly instead of showing wrong colors", async () => {
  await assert.rejects(() => highlight("x", "ruby" as Language));
});
