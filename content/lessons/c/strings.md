{{analogy}}

## Characters

A `char` holds one character. A single character is written in single quotes, such as `'A'`. `%c` prints one as a character, and `%d` prints its number. A `char` is a small whole number, and on most computers `'A'` is 65, `'B'` is 66 and so on. Single quotes and double quotes mean different things: `'A'` is one character, and `"A"` is text.

{{example codes}}

## Strings are arrays of characters

C has no string type. A **string** is an array of `char` that ends with the character `'\0'`, called the **terminator**. Its value is 0. `char word[] = "Ada";` makes an array of four items: `'A'`, `'d'`, `'a'` and `'\0'`. `%s` prints a string, up to the terminator. The text in double quotes is a **string literal**. Do not change a string literal itself. Copy it into an array, as here, if you want to change it. In Python, [Strings](/courses/python/strings) cannot be changed in place; a C array of characters can.

{{example basics}}

## Length

`strlen` from `<string.h>` counts the characters up to, but not including, the terminator. It gives a size, whose type is called `size_t`: print it with `%zu`. `sizeof` gives the size of the whole array in bytes, including the terminator and any spare room.

{{example length}}

`strlen` does a simple job: it counts until it meets the terminator.

{{example count}}

## Reading a word with scanf

`scanf` with `%s` reads one word, up to the next space or line break. Give it an array that is big enough. `char name[20]` holds up to 19 letters, because the terminator needs one item. Write a width in the placeholder: `%19s` stops after 19 characters. There is no `&` here: the name of an array already stands for the place where it is, and [Pointers](/courses/c/pointers), the next lesson, explains that. The typed line is in the Typed input panel.

{{example scanf}}

Without a width, `%s` has no limit. If the person types more than the array can hold, `scanf` writes past the end of the array. That is undefined behavior, and a classic security bug. A width one less than the size is the safe form; a width equal to the size is still one too many. You may see `gets` in old code. It cannot be used safely, it was removed from the C standard in 2011, and it is not declared when you compile with `-std=c17`.

## Comparing and copying

`==` and `=` do not work on strings the way they do in Python. `strcmp(a, b)` gives 0 when the two strings are equal, so the test is `strcmp(a, b) == 0`. When they are different, it gives a number that is not 0, and this lesson uses only whether it is 0.

{{example compare}}

`strcpy(destination, source)` copies the characters of `source`, including the terminator, into `destination`. The destination must be big enough for the whole string, including the terminator. If it is not, `strcpy` writes past the end, which is undefined behavior again. gcc can sometimes tell at compile time, but not when the text is typed in. `strncpy` copies at most a given number of characters, but it does not add the terminator when the source is that long or longer, so you must add it yourself.

{{example copy}}

## Room for the terminator

`char word[3] = "cat";` fits the three letters but has no room for the terminator. gcc 13 says nothing, whatever flags you use. The array is not a string, and `printf("%s")` or `strlen` on it would read past the end: undefined behavior. Let the compiler count: `char word[] = "cat";` makes an array of four.
