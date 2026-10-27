// Node module hooks for `npm run test:unit`, so unit tests can render React
// components. Node strips TypeScript types itself but cannot read JSX, so .tsx
// files are compiled here with the TypeScript compiler the project already
// uses. The "@/..." and "@content/..." path aliases from tsconfig.json are
// resolved to their folders. "server-only" resolves to its empty module, as it
// does for server code in a Next.js build (outside one it throws on purpose).
// Used by tests only; the site is built by Next.js.
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const ALIASES = { "@/": "src/", "@content/": "content/" };

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: new URL("node_modules/server-only/empty.js", root).href, shortCircuit: true };
  for (const [alias, folder] of Object.entries(ALIASES)) {
    if (!specifier.startsWith(alias)) continue;
    const base = new URL(folder + specifier.slice(alias.length), root);
    for (const extension of ["", ".ts", ".tsx"]) {
      const candidate = fileURLToPath(base) + extension;
      if (await access(candidate).then(() => !candidate.endsWith("/"), () => false)) {
        return nextResolve(base.href + extension, context);
      }
    }
  }
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    // Packages without an "exports" map, such as next/link, need the .js file name in ES modules.
    if (error?.code === "ERR_MODULE_NOT_FOUND" && /^[a-z@][^:]*\/[^.]+$/.test(specifier)) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith(".tsx")) return nextLoad(url, context);
  const { outputText } = ts.transpileModule(await readFile(fileURLToPath(url), "utf8"), {
    fileName: fileURLToPath(url),
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return { format: "module", source: outputText, shortCircuit: true };
}
