## What Python does with your file

A Python program is a text file whose name ends in `.py`. To run it, you give the file to Python. Python is itself a program, called an **interpreter**: it reads your instructions and carries them out.

Python first reads the whole file to check that it is written correctly. Then it carries out the lines one at a time, from the top. That is why a writing mistake can stop a program before its first line runs. The first common mistake below shows this.

{{analogy}}

## Your first program

Here is a complete Python program of two lines. CodeBloom ran it, and the output below is what it showed.

{{example hello}}

A Python program needs no extra lines around its instructions. Each line is one instruction.

You can run this program without installing anything: use the "Try it in the playground" link under the example. To run it on your own computer, install Python. Then, in a terminal (a window where you type commands), go to the folder that contains `first_hello.py` and type `python3 first_hello.py`. We tested that command with Python 3.13 in a Linux terminal. On Windows and macOS the command can differ, and this lesson does not cover those steps yet.

## Lines, blank lines and comments

Every `print` ends its line, so each one appears on its own line, in the order the lines run.

A line that starts with `#` is a **comment**: a note for people. Python ignores everything from the `#` to the end of the line. A `#` inside quotes is different: it is part of the text, so it is shown.

{{example order}}
