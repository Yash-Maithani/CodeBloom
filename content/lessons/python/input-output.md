## Asking for input

In Python, `input` shows a **prompt**, a short message that tells the person what to type, and then waits. The person types a line and presses Enter. `input` gives the line back to the program, and the program can keep it in a variable.

{{example greet}}

The playground link under the example opens with `Ada` already in the Input box. Press Run, and the line you typed appears right after the prompt in the output, the way it does in a terminal.

{{analogy}}

## Input is always text

Whatever the person types, `input` gives back a string. Even when the person types digits, what you get is text. You met types in [Variables and data types](/courses/python/variables).

{{example type}}

## Turning text into a number

`int` converts text that represents a whole number, such as "17", into a number. Spaces around the number and a minus sign are accepted too. Use it on what `input` gives back.

{{example age}}

You can combine the two steps in one line. Python works from the inside out: `input` runs first and returns text, then `int` converts it.

{{example sum}}
