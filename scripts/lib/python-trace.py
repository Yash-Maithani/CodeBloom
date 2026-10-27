# Runs one Python example line by line and prints its trace as JSON, for the
# step-through visuals (SPEC.md FR-V1 to FR-V3). It is run by
# scripts/lib/example-runner.mjs with the same limits as every example
# (no shell, timeout, output cap, minimal environment), never by the site.
#
# For each line that really runs, in order, it records:
#   line       the line number that ran
#   variables  every variable the example defines, after that line ran:
#              name, value (Python's repr) and type name
#   output     everything the program had printed so far
# Python's own names never appear: no dunder names (__name__, __builtins__),
# no modules, no builtin functions, even if the example imports or assigns one.
# The trace contains no file paths, so it is the same on every machine.

import io
import json
import sys
import types

path = sys.argv[1]
with open(path, encoding="utf-8") as file:
    source = file.read()
code = compile(source, path, "exec")

output = io.StringIO()
scope = {"__name__": "__main__"}
events = []  # (line about to run, variables before it, output before it)

INTERNAL_TYPES = (types.ModuleType, types.BuiltinFunctionType, types.BuiltinMethodType)


def variables():
    return [
        {"name": name, "value": repr(value), "type": type(value).__name__}
        for name, value in scope.items()
        if not (name.startswith("__") and name.endswith("__")) and not isinstance(value, INTERNAL_TYPES)
    ]


def tracer(frame, event, arg):
    if frame.f_code.co_filename != path:
        return None
    if event == "line":
        events.append((frame.f_lineno, variables(), output.getvalue()))
    return tracer


real_stdout = sys.stdout
sys.stdout = output
sys.settrace(tracer)
try:
    exec(code, scope)
finally:
    sys.settrace(None)
    sys.stdout = real_stdout

# Each step is a line that ran, with the state just after it: the state at the
# next line event, or the final state after the last line.
final = (None, variables(), output.getvalue())
steps = []
for index, (line, _, _) in enumerate(events):
    after = events[index + 1] if index + 1 < len(events) else final
    steps.append({"line": line, "variables": after[1], "output": after[2]})

sys.stdout.write(json.dumps({"steps": steps}, indent=2, ensure_ascii=False) + "\n")
