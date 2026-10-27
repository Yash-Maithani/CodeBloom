import { test } from "node:test";
import assert from "node:assert/strict";
import { PythonRunner, type RunEvent, type WorkerLike } from "./python-runner.ts";

// A stand-in for the Python worker: the test decides what it sends.
class FakeWorker implements WorkerLike {
  onmessage: WorkerLike["onmessage"] = null;
  onerror: WorkerLike["onerror"] = null;
  sent: unknown[] = [];
  terminated = false;
  postMessage(message: unknown) { this.sent.push(message); }
  terminate() { this.terminated = true; }
  send(data: object) { this.onmessage?.({ data: data as never }); }
}

function setup(limits = { time: 5000, output: 20 }) {
  const workers: FakeWorker[] = [];
  let pending: (() => void) | null = null;
  const timers = { set: (callback: () => void) => { pending = callback; return 1; }, clear: () => { pending = null; } };
  const runner = new PythonRunner(() => { const w = new FakeWorker(); workers.push(w); return w; }, timers, limits);
  return { runner, workers, fireTimer: () => pending?.() };
}

test("nothing starts until the first run; progress is passed on; the run is sent once Python is ready", async () => {
  const { runner, workers } = setup();
  assert.equal(workers.length, 0);
  const events: RunEvent[] = [];
  const done = runner.run("print(1)", ["x"], (e) => events.push(e));
  workers[0].send({ type: "progress", loaded: 5, total: 10 });
  assert.equal(workers[0].sent.length, 0);
  workers[0].send({ type: "ready" });
  assert.deepEqual(workers[0].sent, [{ type: "run", code: "print(1)", input: ["x"] }]);
  workers[0].send({ type: "output", stream: "out", text: "1\n" });
  workers[0].send({ type: "done", error: null });
  assert.deepEqual(await done, { kind: "finished" });
  assert.deepEqual(events, [{ kind: "progress", loaded: 5, total: 10 }, { kind: "running" }, { kind: "output", stream: "out", text: "1\n" }]);
});

test("every run gets a fresh worker: the used one is terminated and a spare starts", async () => {
  const { runner, workers } = setup();
  const first = runner.run("a", [], () => {});
  workers[0].send({ type: "ready" });
  workers[0].send({ type: "done", error: null });
  await first;
  assert.equal(workers[0].terminated, true);
  assert.equal(workers.length, 2);
  workers[1].send({ type: "ready" });
  const second = runner.run("b", [], () => {});
  assert.deepEqual(workers[1].sent, [{ type: "run", code: "b", input: [] }]);
  workers[1].send({ type: "done", error: null });
  await second;
  assert.equal(workers.length, 3);
});

test("the time limit terminates the worker and the next run still works", async () => {
  const { runner, workers, fireTimer } = setup();
  const run = runner.run("while True: pass", [], () => {});
  workers[0].send({ type: "ready" });
  workers[0].send({ type: "output", stream: "out", text: "before\n" });
  fireTimer();
  assert.deepEqual(await run, { kind: "timeout" });
  assert.equal(workers[0].terminated, true);
  workers[1].send({ type: "ready" });
  const next = runner.run("print(2)", [], () => {});
  workers[1].send({ type: "done", error: null });
  assert.deepEqual(await next, { kind: "finished" });
});

test("output past the limit is cut exactly at the limit and the worker terminated", async () => {
  const { runner, workers } = setup({ time: 5000, output: 10 });
  const shown: string[] = [];
  const run = runner.run("loop", [], (e) => { if (e.kind === "output") shown.push(e.text); });
  workers[0].send({ type: "ready" });
  workers[0].send({ type: "output", stream: "out", text: "123456\n" });
  workers[0].send({ type: "output", stream: "out", text: "abcdef\n" });
  workers[0].send({ type: "output", stream: "out", text: "never shown\n" });
  assert.deepEqual(await run, { kind: "cut" });
  assert.equal(shown.join(""), "123456\nabc");
  assert.equal(workers[0].terminated, true);
});

test("a Python error is read into its kind and line", async () => {
  const { runner, workers } = setup();
  const run = runner.run("print(1/0)", [], () => {});
  workers[0].send({ type: "ready" });
  workers[0].send({ type: "done", error: { type: "ZeroDivisionError", message: 'Traceback (most recent call last):\n  File "main.py", line 1, in <module>\n    print(1/0)\nZeroDivisionError: division by zero\n' } });
  const end = await run;
  assert.equal(end.kind, "error");
  if (end.kind === "error") assert.deepEqual([end.error.kind, end.error.name, end.error.line], ["runtime", "ZeroDivisionError", 1]);
});

test("a failed download ends the run and starts nothing in the background; Run tries again", async () => {
  const { runner, workers } = setup();
  const run = runner.run("a", [], () => {});
  workers[0].send({ type: "load-failed", message: "NetworkError" });
  assert.deepEqual(await run, { kind: "download-failed" });
  assert.equal(workers.length, 1);
  const again = runner.run("a", [], () => {});
  assert.equal(workers.length, 2);
  workers[1].send({ type: "ready" });
  workers[1].send({ type: "done", error: null });
  assert.deepEqual(await again, { kind: "finished" });
});

test("Stop during the first download stops it and does not start another", async () => {
  const { runner, workers } = setup();
  const run = runner.run("a", [], () => {});
  runner.stop();
  assert.deepEqual(await run, { kind: "stopped" });
  assert.equal(workers[0].terminated, true);
  assert.equal(workers.length, 1);
});

test("a worker that crashes while running is reported, and a fresh one is prepared", async () => {
  const { runner, workers } = setup();
  const run = runner.run("x = []", [], () => {});
  workers[0].send({ type: "ready" });
  workers[0].onerror?.({});
  assert.deepEqual(await run, { kind: "crashed" });
  assert.equal(workers.length, 2);
});
