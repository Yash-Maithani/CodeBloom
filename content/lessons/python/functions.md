{{analogy}}

## Defining and calling a function

You have already used functions that Python provides, such as `print`, `input`, `int` and `type`. You can also write your own. `def` is short for "define". Write `def`, a name, parentheses and a colon, then indent the instructions that belong to the function. That indented group is the function's **body**.

{{example greet}}

The parentheses matter. `greet()` calls the function. The name `greet` on its own does not run it.

A function must be defined before the line that calls it runs. Python reads the file from the top, and the `def` line has to run first.

## Parameters: giving a function values

A function that always does the same thing is of limited use. A **parameter** is a name in the parentheses of the `def` line. Each call supplies a value for it.

{{example param}}

The parameter is the name in the `def` line. The argument is the value in the call. A function can have several parameters, separated by commas, and a call must give one argument for each. Arguments are matched to parameters by position.

## Giving a value back with return

{{example return}}

`print` and `return` do different jobs. `print` shows text to a person, and the program cannot use that text afterwards. `return` hands a value to the program, so it can be stored, used in a calculation or printed. A function that works something out should usually return its answer. When a function reaches `return`, it stops: lines after it in the body do not run.

## Names inside a function

A name created inside a function, including its parameters, is **local** to that function: code outside the function cannot use it directly. To use a result outside, return it, then store or use the returned value.
