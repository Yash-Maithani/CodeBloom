{{analogy}}

## Defining and calling a function

You have used functions that C provides, such as `printf` and `scanf`, and you have written one: `main`. You can write your own. A definition starts with the type of value the function hands back, then its name, then its parameters in parentheses, then its instructions in braces. `void` as the type means it hands nothing back, and `(void)` in the parentheses means it takes no values, as in `int main(void)`. Write the function above `main`.

{{example greet}}

A call is the name followed by parentheses and a semicolon. C runs the function's instructions and then carries on after the call. In Python the same idea is written with `def`: see [Functions](/courses/python/functions).

## Parameters

A **parameter** is a variable in the parentheses of the definition, with its own type. Each call supplies a value for it, called the **argument**, and C copies the argument into the parameter.

{{example param}}

## Giving a value back with return

The type before the name says what the function hands back, such as `int` or `double`. `return` ends the function and hands the value to the caller. `printf` shows something to a person, and `return` gives a value to the program, so it can be stored or used in a calculation.

{{example return}}

A function can hand back a decimal number. Its type is then `double`.

{{example average}}

A function can use everything from the earlier lessons, including decisions and input. A `return` can appear in more than one place: the first one C reaches ends the function. The typed lines are in the Typed input panel.

{{example larger}}

## Declaring a function before it is used

C reads the file from the top, so it must know a function before the line that calls it. You can define the function above `main`, as before. Or you can write a **prototype** above `main`: the first line of the definition, followed by a semicolon. It tells the compiler the name, the types of the parameters and the type of the result, and the full definition can come later.

{{example prototype}}

## A function works on copies

C copies each argument into its parameter. The function can change its own parameter, but the caller's variable stays as it was. [Pointers](/courses/c/pointers), a later lesson, show how a function can change the caller's variable. Arrays, the next lesson, behave differently from single numbers, and that lesson explains how.

{{example byvalue}}

A variable declared inside a function, including its parameters, exists only inside that function. The third mistake below shows what happens when other code tries to use it.
