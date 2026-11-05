// An explorer with its text equivalent (DESIGN.md section 7, explorer). The
// results table lists every verified value, so the same facts are there for a
// screen reader that skips the figure and for a browser without JavaScript,
// where the control cannot work: then the control is hidden and the table is
// shown open instead. Rendered on the server.

import { Fragment } from "react";
import { Explorer } from "@/components/explorer";
import { OutputLines } from "@/components/output-lines";
import { buttonStyles } from "@/components/styles";
import type { ExplorerData } from "@/lib/explorer-data";

export function ExplorerTable({ data }: { data: ExplorerData }) {
  const pointer = data.display === "pointer";
  return (
    <div tabIndex={0} role="region" aria-label={`Every result as a table: ${data.title}`} className="overflow-x-auto">
      <table data-explorer-table className="w-full border-collapse text-left text-ui">
        <caption className="sr-only">Every verified result of: {data.title}</caption>
        <thead>
          <tr className="border-b border-edge">
            <th scope="col" className="py-2 pr-4">
              {pointer ? <>What <code className="font-mono">{data.name}</code> points to</> : <code className="font-mono">{data.name}</code>}
            </th>
            {!pointer && data.runs.some((run) => run.path) && <th scope="col" className="py-2 pr-4">Lines that ran</th>}
            <th scope="col" className="py-2">Output of the real run</th>
          </tr>
        </thead>
        <tbody>
          {data.runs.map((run) => (
            <tr key={run.value} className="border-b border-rule align-top">
              <th scope="row" className="py-2 pr-4 font-mono font-normal">{pointer ? <>&amp;{run.value}</> : run.value}</th>
              {!pointer && data.runs.some((r) => r.path) && (
                <td className="py-2 pr-4">
                  {run.path?.filter((step) => step.kind === "ran").map((step, index) => (
                    <Fragment key={index}>
                      {index > 0 && ", "}
                      {step.line}
                    </Fragment>
                  ))}
                </td>
              )}
              <td className="py-2">
                {run.failed && <span className="font-bold">Error: </span>}
                <OutputLines text={run.failed ? (run.output.split("\n").at(-1) ?? "") : run.output} empty="nothing" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExplorerBlock({ data, headingLevel = 3 }: { data: ExplorerData; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = `explorer-${data.id.replace("/", "-")}`;
  return (
    <section aria-labelledby={headingId} data-explorer-block={data.id} className="max-w-page">
      <Heading id={headingId} className="font-heading text-h3">
        {data.title}
      </Heading>
      <p className="mt-2 max-w-measure text-ui text-ink-muted">Change the value and watch what happens. Every result shown comes from really running this program with that value.</p>
      <div className="mt-4">
        <Explorer data={data} title={null} regionLabel={`${data.languageLabel} code: ${data.title}`} />
      </div>
      <details data-explorer-details className="mt-4">
        <summary className={`${buttonStyles.secondary} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>Every result as a table</summary>
        <div className="mt-4">
          <ExplorerTable data={data} />
        </div>
      </details>
      <noscript>
        <style>{`[data-explorer-block="${data.id}"] [data-explorer-control], [data-explorer-block="${data.id}"] [data-explorer-details] { display: none; }`}</style>
        <div className="mt-4">
          <ExplorerTable data={data} />
        </div>
      </noscript>
    </section>
  );
}
