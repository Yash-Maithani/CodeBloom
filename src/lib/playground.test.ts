import { test } from "node:test";
import assert from "node:assert/strict";
import { readPythonError, splitInput } from "./playground.ts";

// Messages captured from Pyodide 314.0.7 (Python 3.14.2) running each program
// with filename main.py, as the worker does.
const INTERNAL = '  File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async\n    await CodeRunner(\n    ...<10 lines>...\n    .run_async(globals, locals)\n  File "/lib/python314.zip/_pyodide/_base.py", line 420, in run_async\n    coroutine = eval(self.code, globals, locals)\n';
const PARSE = '  File "/lib/python314.zip/_pyodide/_base.py", line 619, in eval_code_async\n    await CodeRunner(\n          ~~~~~~~~~~^\n        source,\n        ^^^^^^^\n    ...<6 lines>...\n        dedent=dedent,\n        ^^^^^^^^^^^^^^\n    )\n    ^\n  File "/lib/python314.zip/_pyodide/_base.py", line 294, in __init__\n    self.ast = next(self._gen)\n               ~~~~^^^^^^^^^^^\n  File "/lib/python314.zip/_pyodide/_base.py", line 151, in _parse_and_compile_gen\n    mod = compile(source, filename, mode, flags | ast.PyCF_ONLY_AST)\n';
const T = "Traceback (most recent call last):\n";

test("a runtime error keeps only main.py frames, as python3 main.py prints it", () => {
  const error = readPythonError(`${T}${INTERNAL}  File "main.py", line 2, in <module>\n    print(1/0)\n          ~^~\nZeroDivisionError: division by zero\n`);
  assert.deepEqual(error, {
    kind: "runtime",
    name: "ZeroDivisionError",
    line: 2,
    text: 'Traceback (most recent call last):\n  File "main.py", line 2, in <module>\n    print(1/0)\n          ~^~\nZeroDivisionError: division by zero',
  });
});

test("an error inside a function names the deepest line of main.py", () => {
  const error = readPythonError(`${T}${INTERNAL}  File "main.py", line 3, in <module>\n    f()\n    ~^^\n  File "main.py", line 2, in f\n    return g()\n           ^\nNameError: name 'g' is not defined\n`);
  assert.equal(error.line, 2);
  assert.equal(error.name, "NameError");
  assert.match(error.text, /line 3, in <module>[\s\S]*line 2, in f/);
  assert.doesNotMatch(error.text, /_pyodide/);
});

test("syntax and indentation errors have no Traceback heading and say nothing ran", () => {
  const syntax = readPythonError(`${T}${PARSE}  File "main.py", line 1\n    print('hi'\n         ^\nSyntaxError: '(' was never closed\n`);
  assert.deepEqual(syntax, { kind: "syntax", name: "SyntaxError", line: 1, text: "  File \"main.py\", line 1\n    print('hi'\n         ^\nSyntaxError: '(' was never closed" });
  const indent = readPythonError(`${T}${PARSE}  File "main.py", line 2\n    print(1)\n    ^^^^^\nIndentationError: expected an indented block after 'if' statement on line 1\n`);
  assert.equal(indent.kind, "syntax");
  assert.equal(indent.line, 2);
});

test("running out of input and missing packages are their own kinds; Pyodide's install hint is removed", () => {
  const input = readPythonError(`${T}${INTERNAL}  File "main.py", line 2, in <module>\n    b = input()\nEOFError: EOF when reading a line\n`);
  assert.equal(input.kind, "input");
  const pkg = readPythonError(`${T}${INTERNAL}  File "main.py", line 1, in <module>\n    import numpy\nModuleNotFoundError: No module named 'numpy'\nThe module 'numpy' is included in the Pyodide distribution, but it is not installed.\nYou can install it by calling:\n  await micropip.install("numpy") in Python, or\n  await pyodide.loadPackage("numpy") in JavaScript\nSee https://pyodide.org/en/stable/usage/loading-packages.html for more details.\n`);
  assert.equal(pkg.kind, "package");
  assert.equal(pkg.text, "Traceback (most recent call last):\n  File \"main.py\", line 1, in <module>\n    import numpy\nModuleNotFoundError: No module named 'numpy'");
});

test("the Input box gives one input() line per line; a final line break adds nothing", () => {
  assert.deepEqual(splitInput(""), []);
  assert.deepEqual(splitInput("Ana\n17"), ["Ana", "17"]);
  assert.deepEqual(splitInput("Ana\r\n17\r\n"), ["Ana", "17"]);
  assert.deepEqual(splitInput("\n"), [""]);
  assert.deepEqual(splitInput("a\n\nb"), ["a", "", "b"]);
});
