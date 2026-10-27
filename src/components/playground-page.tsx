import Link from "next/link";
import { Container } from "@/components/container";
import { Playground } from "@/components/playground";
import { textLinkStyles } from "@/components/styles";
import { loadStarter, pythonDownloadBytes } from "@/lib/playground-starters";

/**
 * The playground pages: /playground starts from python/hello, and each
 * /playground/python/<example> starts from that lesson example, with the
 * Input box filled from the example's input file if it has one. `from` names
 * the lesson the example comes from.
 */
export async function PlaygroundPage({ file, from }: { file: string; from?: { title: string; href: string } }) {
  const [starter, downloadBytes] = await Promise.all([loadStarter(file), pythonDownloadBytes()]);
  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-heading text-3xl font-semibold">Python playground</h1>
      <p className="mt-4 max-w-measure text-lg">
        Write Python and run it in your browser. Your code runs on your device: nothing is saved or sent anywhere.
      </p>
      {from && (
        <p className="mt-2 max-w-measure">
          The code below is an example from the lesson{" "}
          <Link href={from.href} className={textLinkStyles}>
            {from.title}
          </Link>
          . Change it and run it again.
        </p>
      )}
      <p className="mt-2 max-w-measure text-sm text-ink-muted">Python only. C, C++ and Java are not yet supported in the playground.</p>
      <noscript>
        <p className="mt-6 max-w-measure rounded-panel border border-l-3 border-rule border-l-warning bg-sheet px-4 py-3">
          Running code needs JavaScript. You can still copy the code below and run it with Python on your computer.
        </p>
      </noscript>
      <div className="mt-8">
        <Playground starter={starter.code} starterInput={starter.input} downloadBytes={downloadBytes} />
      </div>
    </Container>
  );
}
