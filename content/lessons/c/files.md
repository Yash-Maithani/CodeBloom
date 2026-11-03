{{analogy}}

## Writing a file and reading it back

`fopen` opens a file. It takes the file's name and a **mode**: `"w"` to write, `"r"` to read and `"a"` to append. It gives back a `FILE *`, a pointer to a record that the C library keeps about the open file. You never look inside a `FILE`: you pass the pointer to the functions that use the file. A name such as `"notes.txt"` means "in the folder the program runs in". `FILE`, `fopen`, `fprintf`, `fgets` and `fclose` are declared in `<stdio.h>`, which every program already includes.

`fprintf` works like `printf`, with the file as its first argument, and writes to the file instead of the screen. It adds no line break of its own, so end each line with `\n`. `"w"` creates the file if it is not there, and empties it if it is. `fclose` closes the file. In Python the same job is done with `with open(...)`: see [Reading and writing files](/courses/python/files).

In this lesson every program writes the file it reads, so each one runs on its own. The CodeBloom example runner runs each program in a temporary folder that is deleted afterwards, so these programs leave nothing in the project. When you run one yourself, the file stays in your folder.

{{example write}}

## Opening can fail

`fopen` gives back `NULL` when it cannot open the file, for example when you read a file that does not exist or write in a folder that does not exist. This is the `NULL` from [Pointers](/courses/c/pointers). Check for it before you use the file. A non-zero value returned from `main` tells the system that the program had a problem, as `return 0` tells it that there was none.

Using a `NULL` `FILE *` with `fprintf`, `fgets` or `fclose` is **undefined behavior**: the rules of C do not say what happens. In CodeBloom's tests with gcc 13.3 on Linux, each of the three stopped the program with a segmentation fault, and plain gcc, `-Wall` and `-Wextra` gave no message. Only `-fanalyzer` warned (`-Wanalyzer-possible-null-argument`). C does not promise either result, so the examples never use a `NULL` file.

{{example missing}}

## Reading line by line

`fgets(line, sizeof line, file)` reads one line into the `char` array `line`. The second argument is the size of the array. `fgets` reads at most one fewer than that, because it stores the terminator `'\0'` too, so it does not write past the end. Pass `sizeof line` where the array is declared, as in [Arrays](/courses/c/arrays), and never a number you typed: a size bigger than the array lets `fgets` write past the end, which is undefined behavior. In CodeBloom's test with gcc 13.3 on Linux, gcc warned about a size of 100 for an array of 4 (`-Wstringop-overflow=`) and the program that ran printed "stack smashing detected", but C does not promise either result. `fgets` gives back `NULL` when there is nothing left to read, so a `while` loop that tests for `NULL` goes through the whole file.

{{example lines}}

`fgets` keeps the newline. It copies characters up to and including the line break, and stops there, so the line break is part of what it read. That is useful: if the buffer is too small, `fgets` fills it and stops before the line break, and the rest of the line waits in the file for the next `fgets`. So the line break tells you whether the whole line fitted. The last line of a file may have no line break at all.

{{example smallbuffer}}

To remove the line break, check the last character of the line. `strlen` is from [Strings](/courses/c/strings).

{{example strip}}

## Numbers from a file are text

Everything read from a text file is text, even when it looks like a number. `sscanf` is `scanf` reading from a string instead of the keyboard: its first argument is the string, and the rest are as in [Printing and reading values with printf and scanf](/courses/c/printf-scanf). It gives back the number of values it stored, so 1 means it found a number. The line break after the digits is skipped.

{{example numbers}}

## Adding to a file

`"a"` is append mode: new text goes at the end, and what is already in the file stays. It creates the file if it is not there. Opening with `"w"` is different: it empties the file first. The first mistake below shows how easily that loses data.

{{example append}}

## Closing the file

`fprintf` does not write straight to the file. It puts the text in a buffer in memory, and the text reaches the file later. `fclose` sends whatever is left and gives the file back to the system. Here is what C does and does not promise.

C guarantees that returning from `main` (like calling `exit`) flushes and closes every open file. So a short program that forgets `fclose` still gets its text into the file: in CodeBloom's test with gcc 13.3 on Linux, the file held the text after such a program ended. That does not make `fclose` unnecessary, as the next points show.

C does not say when the text reaches the file before the close. In the same test, a second `fopen` of a file that was still open for writing read nothing. The second mistake below shows this. `fflush(file)` sends the buffer without closing the file, and it fixed that test.

If the program ends abnormally, text still in the buffer can be lost. In the test, a program that called `abort()` without closing left an empty file, and with `fflush` before the `abort()` the file held the text.

A program can have only a limited number of files open at once. In the test, a loop that opened a file again and again without closing it eventually got `NULL` from `fopen`. Close each file as soon as you are done with it.

gcc with `-Wall -Wextra` did not report a missing `fclose`. `-fanalyzer` reported the leaking loop (`-Wanalyzer-file-leak`).
