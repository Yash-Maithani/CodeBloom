// Drives the Python worker (src/workers/python-worker.ts) from the page and
// enforces the limits: the time limit terminates the worker, and output past
// the limit is cut off and the worker terminated. A worker runs one program;
// afterwards a fresh one starts in the background so the next run is clean
// and fast (PROGRESS.md D57). Nothing is downloaded until the first run.

import { OUTPUT_LIMIT, TIME_LIMIT_MS, readPythonError, type PythonErrorInfo } from "./playground.ts";

/** The part of a Web Worker the runner uses, so tests can pass a fake. */
export type WorkerLike = {
  postMessage(message: unknown): void;
  terminate(): void;
  onmessage: ((event: { data: WorkerMessage }) => void) | null;
  onerror: ((event: unknown) => void) | null;
};

type WorkerMessage =
  | { type: "progress"; loaded: number; total: number }
  | { type: "ready" }
  | { type: "load-failed"; message: string }
  | { type: "output"; stream: "out" | "err" | "input"; text: string }
  | { type: "done"; error: { type: string; message: string } | null };

export type RunEvent =
  | { kind: "progress"; loaded: number; total: number }
  | { kind: "running" }
  | { kind: "output"; stream: "out" | "err" | "input"; text: string };

export type RunEnd =
  | { kind: "finished" }
  | { kind: "error"; error: PythonErrorInfo }
  | { kind: "timeout" }
  | { kind: "cut" }
  | { kind: "stopped" }
  | { kind: "download-failed" }
  | { kind: "crashed" };

type Timers = { set(callback: () => void, ms: number): unknown; clear(handle: unknown): void };

type Slot = { worker: WorkerLike; ready: boolean; failed: boolean; waiting?: () => void; progress?: (event: RunEvent) => void };

export class PythonRunner {
  private spare: Slot | null = null;
  private active: { slot: Slot; finish: (end: RunEnd) => void } | null = null;
  private hasLoaded = false;
  private readonly createWorker: () => WorkerLike;
  private readonly timers: Timers;
  private readonly limits: { time: number; output: number };

  constructor(
    createWorker: () => WorkerLike,
    timers: Timers = { set: (callback, ms) => setTimeout(callback, ms), clear: (handle) => clearTimeout(handle as number) },
    limits = { time: TIME_LIMIT_MS, output: OUTPUT_LIMIT },
  ) {
    this.createWorker = createWorker;
    this.timers = timers;
    this.limits = limits;
  }

  /** True once Python has been downloaded and started on this page. */
  get downloaded(): boolean {
    return this.hasLoaded;
  }

  private startWorker(): Slot {
    const slot: Slot = { worker: this.createWorker(), ready: false, failed: false };
    slot.worker.onmessage = ({ data }) => {
      if (data.type === "progress") slot.progress?.({ kind: "progress", loaded: data.loaded, total: data.total });
      if (data.type === "ready") {
        slot.ready = true;
        this.hasLoaded = true;
        slot.waiting?.();
      }
      if (data.type === "load-failed") this.loadFailed(slot);
    };
    slot.worker.onerror = () => this.loadFailed(slot);
    return slot;
  }

  private loadFailed(slot: Slot) {
    slot.failed = true;
    slot.worker.terminate();
    if (this.spare === slot) this.spare = null;
    slot.waiting?.();
  }

  /** Runs `code` with one input() line per entry of `input`. Resolves when the run has ended in any way. */
  run(code: string, input: string[], onEvent: (event: RunEvent) => void): Promise<RunEnd> {
    if (this.active) throw new Error("A run is already in progress");
    const slot = this.spare && !this.spare.failed ? this.spare : this.startWorker();
    this.spare = null;

    return new Promise<RunEnd>((resolve) => {
      let timer: unknown;
      let written = 0;
      let ended = false;
      const finish = (end: RunEnd) => {
        if (ended) return;
        ended = true;
        this.timers.clear(timer);
        slot.worker.onmessage = null;
        slot.worker.onerror = null;
        slot.worker.terminate();
        this.active = null;
        // Prepare the next clean Python, unless Python never started here
        // (offline, or the learner stopped the first download).
        if (this.hasLoaded && end.kind !== "download-failed") this.spare = this.startWorker();
        resolve(end);
      };
      this.active = { slot, finish };

      const begin = () => {
        slot.waiting = undefined;
        slot.progress = undefined;
        if (slot.failed) return finish({ kind: "download-failed" });
        slot.worker.onmessage = ({ data }) => {
          if (data.type === "output") {
            const room = this.limits.output - written;
            const text = data.text.slice(0, Math.max(room, 0));
            written += data.text.length;
            if (text) onEvent({ kind: "output", stream: data.stream, text });
            if (written > this.limits.output) finish({ kind: "cut" });
          }
          if (data.type === "done") {
            finish(data.error ? { kind: "error", error: readPythonError(data.error.message) } : { kind: "finished" });
          }
        };
        // Python itself failing after it started, for example running out of memory.
        slot.worker.onerror = () => finish({ kind: "crashed" });
        onEvent({ kind: "running" });
        timer = this.timers.set(() => finish({ kind: "timeout" }), this.limits.time);
        slot.worker.postMessage({ type: "run", code, input });
      };

      if (slot.ready || slot.failed) begin();
      else {
        slot.progress = onEvent;
        slot.waiting = begin;
      }
    });
  }

  /** Stops the current download or run. */
  stop(): void {
    this.active?.finish({ kind: "stopped" });
  }

  /** Stops everything, for example when the page is left. */
  dispose(): void {
    this.stop();
    this.spare?.worker.terminate();
    this.spare = null;
  }
}
