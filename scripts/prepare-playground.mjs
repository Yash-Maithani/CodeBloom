// Prepares the Python playground's static files before `next dev` and
// `next build` (PROGRESS.md D56, D58). Nothing here is committed:
//   public/pyodide/<version>/  the five Pyodide files, copied unchanged from
//                              the exact version npm installed (package-lock.json)
//   public/python-worker.mjs   src/workers/python-worker.ts compiled to JavaScript,
//                              with the exact sizes of the files Python fetches
// Plain Node, no dependency beyond the TypeScript compiler already installed.

import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const require = createRequire(import.meta.url);
const pkgDir = path.dirname(require.resolve("pyodide/package.json"));
const version = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8")).version;
const expected = readFileSync(path.join(root, "src/lib/playground.ts"), "utf8").match(/PYODIDE_VERSION = "([^"]+)"/)?.[1];
const workerSource = readFileSync(path.join(root, "src/workers/python-worker.ts"), "utf8");
if (version !== expected || !workerSource.includes(`/pyodide/${version}/`)) {
  console.error(`prepare-playground: installed pyodide is ${version}, but src/lib/playground.ts and the worker must name the same version (found ${expected}). Update them together.`);
  process.exit(1);
}

// pyodide.mjs and pyodide.asm.mjs are loaded with import(); the other three with fetch(), which the worker counts.
const FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide-lock.json", "python_stdlib.zip", "pyodide.asm.wasm"];
const FETCHED = ["pyodide-lock.json", "python_stdlib.zip", "pyodide.asm.wasm"];

const out = path.join(root, "public", "pyodide");
rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, version), { recursive: true });
for (const file of FILES) copyFileSync(path.join(pkgDir, file), path.join(out, version, file));
writeFileSync(
  path.join(out, version, "NOTICE.txt"),
  `Pyodide ${version}, unmodified, from the npm package "pyodide".\nLicense: Mozilla Public License 2.0. Source code: https://github.com/pyodide/pyodide\nPython and its standard library: Python Software Foundation License.\n`,
);

const sizes = Object.fromEntries(FETCHED.map((file) => [file, statSync(path.join(pkgDir, file)).size]));
const compiled = ts.transpileModule(workerSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
if (!compiled.includes("__PYODIDE_SIZES__")) throw new Error("prepare-playground: the worker has no __PYODIDE_SIZES__ placeholder");
writeFileSync(path.join(root, "public", "python-worker.mjs"), compiled.replace("__PYODIDE_SIZES__", JSON.stringify(sizes).replace(/"/g, '\\"')));
console.log(`prepare-playground: Pyodide ${version} copied; worker written; Python fetches ${(Object.values(sizes).reduce((a, b) => a + b, 0) / 1e6).toFixed(1)} MB at first start.`);
