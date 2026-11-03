{{analogy}}

## Printing several values

You have used `printf` with one placeholder. A format string can hold several: `%d` for an `int` and `%f` for a `double`. They are filled in order, with one value for each placeholder. A calculation works as a value. The placeholder must match the type of its value, and a mismatch is undefined behavior. gcc reports it when you compile with `-Wall`, and CodeBloom's strict flags turn that report into an error.

{{example printf}}

## Reading a number with scanf

**Input** is what a person types while the program runs. `scanf` reads the typed characters and converts them into a number. The first argument says what to read: `%d` means a whole number. The second says where to store it: `&age`. The `&` is required. It tells `scanf` where in memory `age` lives, so it can store the number there. A later lesson, [Pointers](/courses/c/pointers), explains why it works this way. For now, write `&` before every variable you give to `scanf`.

Give the variable a starting value first. If `scanf` cannot read a number it stores nothing, and reading a variable that never got a value is undefined behavior.

Each example with typed input shows a **Typed input** panel: the lines a person typed while the program ran. A terminal draws those characters on your screen as you type. The program does not print them, so they are not in the Expected output panel. That is why the prompt and the next text appear side by side there.

{{example age}}

To try it yourself, compile with `-Wall` and run the program, for example `gcc -Wall io_age.c -o io_age` and then `./io_age`. Type 17 and press Enter. The `-Wall` option makes gcc report mistakes like the ones below. On some systems, such as Ubuntu, gcc reports the first two of them even without `-Wall`, but not on every system, so compiling with `-Wall` is a good habit.

## Two numbers, and decimal numbers

`scanf` skips spaces and line breaks before a number, so two calls can read two lines. One call can also read both: `scanf("%d %d", &first, &second)` reads two whole numbers from one line.

{{example sum}}

For a `double`, `printf` uses `%f`, but `scanf` needs `%lf`.

{{example double}}

## What scanf returns

`scanf` returns the number of values it stored. It returns 1 here, because one number was read. When it cannot read what you asked for, it returns less, and when the input has ended it returns a negative number.

{{example count}}
