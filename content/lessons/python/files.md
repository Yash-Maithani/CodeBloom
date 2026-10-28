{{analogy}}

## Writing a file and reading it back

The programs so far lost their variables when they ended. A file keeps text after the program ends. In this lesson every program writes a file and then reads it back, so each one runs on its own.

`open` takes the file's name and a **mode**: `"w"` to write and `"r"` to read. `with open(...) as file:` opens the file, gives it the name `file` inside the indented group, and closes it when the group ends. Closing matters: text you wrote may not be in the file until it is closed. `"w"` creates the file if it is not there.

{{example write}}

A file is created in the folder the program runs in. In the CodeBloom playground, the file lives only in the browser's own temporary file area. It is gone when the run ends, nothing is saved on your computer, and a later run cannot see it.

## Reading line by line

A `for` loop over a file gives one line at a time, like a loop over a list. Each line still ends with its line break, so `strip()` is used to remove it.

{{example lines}}

## Numbers from a file are text

Everything read from a text file is a string, even when it looks like a number. Convert it with `int`, as in [Input and output](/courses/python/input-output).

{{example numbers}}

## Adding to a file

`"a"` is append mode: new text goes at the end, and what is already in the file stays. It creates the file if it is not there. Opening with `"w"` is different: it empties the file first. The first mistake below shows how easily that loses data.

{{example append}}
