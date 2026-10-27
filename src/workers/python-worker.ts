// Runs one learner program in Python (Pyodide), then is thrown away: every
// run gets a fresh Python, as `python3 main.py` would (PROGRESS.md D57).
//
// This file is not bundled by Next.js. scripts/prepare-playground.mjs compiles
// it to public/python-worker.mjs, which is served with its own Content Security
// Policy (next.config.ts): it may load scripts and connect only to this site.
// It must stay self-contained: it cannot import other files from src/.
//
// Messages to the page:
//   { type: "progress", loaded, total }  bytes of Python received so far
//   { type: "ready" }                     Python started; send { type: "run" }
//   { type: "load-failed", message }      Python could not be downloaded or started
//   { type: "output", stream, text }      stream is "out", "err" or "input"
//   { type: "done", error }               error is null or { type, message }

type Pyodide = {
  setStdin(options: { stdin: () => string | undefined }): void;
  setStdout(options: { write: (bytes: Uint8Array) => number }): void;
  setStderr(options: { write: (bytes: Uint8Array) => number }): void;
  runPython(code: string, options: { filename: string }): unknown;
};
type Scope = {
  postMessage(message: unknown): void;
  onmessage: ((event: MessageEvent<{ type: "run"; code: string; input: string[] }>) => void) | null;
  fetch: typeof fetch;
} & Record<string, unknown>;

const scope = self as unknown as Scope;
const BASE = "/pyodide/314.0.7/";
// Exact sizes of the files Python fetches while starting, written in by the
// prepare script from the installed package. Progress counts real bytes
// received against these; nothing is estimated.
const SIZES: Record<string, number> = JSON.parse("__PYODIDE_SIZES__");
const TOTAL = Object.values(SIZES).reduce((sum, size) => sum + size, 0);

let loaded = 0;
let lastReport = 0;
function report(force = false) {
  const now = Date.now();
  if (!force && now - lastReport < 100) return;
  lastReport = now;
  scope.postMessage({ type: "progress", loaded, total: TOTAL });
}

// Count the bytes of each counted file as they arrive.
const realFetch = scope.fetch.bind(scope);
scope.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await realFetch(input, init);
  const name = new URL(String(input instanceof Request ? input.url : input), self.location.href).pathname.replace(BASE, "");
  if (!(name in SIZES) || !response.body) return response;
  const counter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      report();
      controller.enqueue(chunk);
    },
  });
  return new Response(response.body.pipeThrough(counter), { status: response.status, statusText: response.statusText, headers: response.headers });
};

async function start(): Promise<Pyodide> {
  const { loadPyodide } = (await import(/* webpackIgnore: true */ `${BASE}pyodide.mjs`)) as { loadPyodide(options: object): Promise<Pyodide> };
  const python = await loadPyodide({ indexURL: BASE, packages: [] });
  report(true);
  // Learner code gets no network: the policy already blocks other sites, and
  // these are removed so this site cannot be reached either.
  for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts"]) scope[name] = undefined;
  return python;
}

const decoders = { out: new TextDecoder(), err: new TextDecoder() };
const writer = (stream: "out" | "err") => (bytes: Uint8Array) => {
  const text = decoders[stream].decode(bytes, { stream: true });
  if (text) scope.postMessage({ type: "output", stream, text });
  return bytes.length;
};

start().then(
  (python) => {
    python.setStdout({ write: writer("out") });
    python.setStderr({ write: writer("err") });
    scope.onmessage = ({ data }) => {
      scope.onmessage = null;
      const lines = [...data.input];
      python.setStdin({
        stdin: () => {
          const line = lines.shift();
          // Show the line as a terminal would after the learner typed it.
          if (line !== undefined) scope.postMessage({ type: "output", stream: "input", text: `${line}\n` });
          return line;
        },
      });
      let error: { type: string; message: string } | null = null;
      try {
        python.runPython(data.code, { filename: "main.py" });
      } catch (caught) {
        const value = caught as { type?: string; message?: string };
        error = { type: value.type ?? "Error", message: value.message ?? String(caught) };
      }
      scope.postMessage({ type: "done", error });
    };
    scope.postMessage({ type: "ready" });
  },
  (caught: unknown) => scope.postMessage({ type: "load-failed", message: String(caught) }),
);
