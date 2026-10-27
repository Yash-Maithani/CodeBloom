// Command-line entry for `npm run check:examples`.
// Takes no arguments on purpose: it only checks the files in content/examples/.
import { fileURLToPath } from "node:url";
import { checkExamples, DEFAULT_TIMEOUT_MS, writeRecordIfPassed } from "./lib/example-runner.mjs";

const root = fileURLToPath(new URL("../content/examples/", import.meta.url));
const recordFile = fileURLToPath(new URL("../content/verified-examples.json", import.meta.url));
const result = await checkExamples({ root });
const { ok, problems, results } = result;

for (const problem of problems) console.error(`PROBLEM  ${problem}`);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.id} (${r.ms} ms)${r.ok ? "" : `\n      ${r.message.replace(/\n/g, "\n      ")}`}`);
}
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed} of ${results.length} examples passed, ${problems.length} problems found (timeout ${DEFAULT_TIMEOUT_MS} ms per step).`);
// A failed run never touches the record, so the last fully verified state stays.
if (await writeRecordIfPassed(result, recordFile)) {
  console.log("Verification record written: content/verified-examples.json");
} else {
  console.log("Verification record NOT updated, because not every example passed.");
}
process.exit(ok ? 0 : 1);
