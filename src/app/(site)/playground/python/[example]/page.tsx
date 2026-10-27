import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaygroundPage } from "@/components/playground-page";
import { playgroundExamples } from "@/lib/site-lessons";

// One static page per example a lesson links to; any other address is a 404.
export const dynamicParams = false;

type Props = { params: Promise<{ example: string }> };

export async function generateStaticParams() {
  return (await playgroundExamples()).map(({ example }) => ({ example: example.id.replace("python/", "") }));
}

async function find(params: Props["params"]) {
  const { example } = await params;
  return (await playgroundExamples()).find((entry) => entry.example.id === `python/${example}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await find(params);
  return {
    title: entry ? `Python playground: ${entry.lesson.source.title}` : "Python playground",
    description: "Run and change a lesson example in your browser. Your code stays on your device.",
  };
}

export default async function Page({ params }: Props) {
  const entry = await find(params);
  if (!entry) notFound();
  return <PlaygroundPage file={entry.example.id.replace("python/", "")} from={{ title: entry.lesson.source.title, href: entry.lesson.href }} />;
}
