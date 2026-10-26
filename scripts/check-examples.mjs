// Command-line entry for `npm run check:examples`.
// Takes no arguments on purpose: it only checks the files in content/examples/.
import { fileURLToPath } from "node:url";
import { checkExamples, DEFAULT_TIMEOUT_MS } from "./lib/example-runner.mjs";

const root = fileURLToPath(new URL("../content/examples/", import.meta.url));
const { ok, problems, results } = await checkExamples({ root });

for (const problem of problems) console.error(`PROBLEM  ${problem}`);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.id} (${r.ms} ms)${r.ok ? "" : `\n      ${r.message.replace(/\n/g, "\n      ")}`}`);
}
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed} of ${results.length} examples passed, ${problems.length} problems found (timeout ${DEFAULT_TIMEOUT_MS} ms per step).`);
process.exit(ok ? 0 : 1);
