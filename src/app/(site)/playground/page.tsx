import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PlaygroundPage } from "@/components/playground-page";

export const metadata: Metadata = pageMetadata({
  path: "/playground",
  title: "Python playground",
  description: "Write Python and run it in your browser. Your code stays on your device.",
});

export default function Page() {
  return <PlaygroundPage file="hello" />;
}
