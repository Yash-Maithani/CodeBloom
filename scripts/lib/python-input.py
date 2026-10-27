"""Runs a lesson example that reads input, feeding it the lines of its .input.txt file.

Usage: python3 -I -B python-input.py <example.py> <example.input.txt>

Python does not echo piped input: when a program reads from a pipe, the typed
text is never shown, because nobody typed it. A person running the program in a
terminal sees the typed line right after the prompt (the terminal draws it), and
the CodeBloom playground shows it the same way. So this script SIMULATES that:
each input() call writes its prompt, then the next line of the input file and a
line break, and returns the line. The output of a lesson example is therefore
what a learner sees, not what a pipe would carry.

One input() call reads one line, and a final line break adds no empty line (the
same rule as src/lib/playground.ts). If the file has too few lines, input()
raises EOFError with Python's own message. Errors are printed as the normal
Python error output, without this script's own frames.
"""

import builtins
import sys
import traceback

THIS_FILE = __file__


def main() -> None:
    source_path, input_path = sys.argv[1], sys.argv[2]
    with open(input_path, encoding="utf-8", newline="") as handle:
        text = handle.read().replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    pending = iter(lines)

    def echoing_input(prompt: object = "") -> str:
        sys.stdout.write(str(prompt))
        try:
            line = next(pending)
        except StopIteration:
            raise EOFError("EOF when reading a line") from None
        sys.stdout.write(line + "\n")
        return line

    builtins.input = echoing_input
    try:
        with open(source_path, encoding="utf-8", newline="") as handle:
            source = handle.read()
        code = compile(source, source_path, "exec")
        exec(code, {"__name__": "__main__", "__file__": source_path})
    except SystemExit:
        raise
    except BaseException as error:  # print like Python does, minus our own frames
        frames = [f for f in traceback.extract_tb(error.__traceback__) if f.filename != THIS_FILE]
        out = ""
        if frames:
            out += "Traceback (most recent call last):\n" + "".join(traceback.format_list(frames))
        out += "".join(traceback.format_exception_only(error))
        sys.stdout.flush()
        sys.stderr.write(out)
        sys.exit(1)


main()
