{{analogy}}

## Variables in Python

A Python program is a list of instructions in a file. Python runs them one at a time, from the top of the file to the bottom.

To create a variable, write a name, `=` and a value. You do not write a type: Python works it out from the value.

{{example change}}

Line 4 is the same instruction as line 2, but `apples` now has a different value, so the output changes.

## Types in Python

You never wrote a type in that example, but Python still knows the type of every value. You can ask for it with `type()`.

{{example types}}

So in Python, values have types and names do not. On line 5, `age` was reassigned from an `int` value to a `str` value, and Python allowed it. A name that switches from a number to text is hard to follow, though, so keep one kind of value per name.

Python also checks types. It does this while the program runs, when it reaches each line. The second common mistake below shows what that looks like.
