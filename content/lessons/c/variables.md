## Variables in C

In C, you create a variable with a **declaration**: the type first, then the name, then a starting value. The type is part of the variable and never changes.

{{analogy}}

Every program in this lesson has the same frame as the one in [Your first C program](/courses/c/first-program): `#include <stdio.h>`, `int main(void)` and `return 0;`. That lesson explains them. Here, look at the lines inside `main`.

{{example change}}

Line 7 is the same instruction as line 5, but `apples` now holds a different value, so the output changes.

## The type is part of the variable

In C you choose the type when you declare a variable, and it stays fixed. The type decides what the variable can store. Two types you will use often:

- `int` for whole numbers, such as `17` or `-4`
- `double` for numbers with a decimal point, such as `2.5`

{{example types}}

Why does C want the type up front? The compiler uses it to set aside the right amount of memory, and to check your program before it runs. So in C, many mistakes are reported when you compile, before the program starts.
