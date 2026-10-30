## From source code to a running program

A file of C source code has a name ending in `.c`. The part of a computer that carries out instructions, the **processor**, cannot read C. It only runs **machine code**: instructions stored as numbers, in a form that depends on the kind of processor. So before a C program can run, a tool called a **compiler** translates the source code into machine code and saves the result as a new file that you can run. This translation is called **compiling**.

Compiling happens once, before the program runs. If the compiler finds something it cannot understand, it stops with an error message: compilation fails, so there is no program to run.

{{analogy}}

## Your first program

Here is a complete C program. CodeBloom compiled and ran it, and the output below is what it printed.

{{example hello}}

On line 3, `int` is the type of the value `main` hands back, a whole number, and `(void)` says `main` needs no input. Every program in these lessons uses this same line.

The lines between `{` and `}` are the program's instructions. They run one at a time, from top to bottom, and each one ends with a semicolon.

## One instruction after another

A program can have many instructions. Watch where the output lines break.

{{example order}}

`printf` does not start a new line by itself. Only `\n` does, wherever it appears in the text.

## Compiling and running it yourself

You do not need to install anything to follow these lessons: CodeBloom has compiled and run every example for you. When you want to try it on your own computer, you need a C compiler. A common one is gcc. In a terminal, a window where you type commands, go to the folder that contains `first_program.c` and run these two commands:

- `gcc first_program.c -o first_program` compiles the source code. `-o first_program` names the new file that holds the machine code.
- `./first_program` runs that file. `./` means "in this folder".

We tested these two commands in a Linux terminal. On macOS and Windows, installing a compiler and running a program work differently, and this lesson does not cover those steps yet.

If you change the source code, compile it again before you run it. The program file only changes when you compile.
