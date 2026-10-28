{{analogy}}

## Text is a sequence of characters

You have used text since the first lesson: `"Hello"` is a **string**, a sequence of **characters**. The characters can be letters, digits, spaces or punctuation, and a space counts as a character. Like the items of a list in [Lists](/courses/python/lists), each character has an index that starts at 0, and `len` also works on a string: it gives the number of characters.

{{example basics}}

Unlike a list, a string cannot have one of its characters replaced. The first mistake below shows what happens.

## Joining strings and building messages

`+` between two strings joins them end to end. Python adds no space, so put one in yourself.

{{example join}}

Joining works only between strings. To put a number into a message, an **f-string** is easier. Write `f` directly before the opening quote, and put a name or a calculation inside curly brackets. Python replaces each pair of brackets with its value.

{{example fstring}}

## Special characters

A backslash inside a string starts an **escape sequence**: a special character written as two characters. `\n` is a **line break**: the text continues on the next line. `\"` is a quote mark that does not end the string.

{{example escape}}

## Methods that give back new strings

A string has methods, like a list has `append`. `strip()` removes spaces and line breaks from both ends of a string, but not from the middle. The brackets in the next example make the spaces visible.

{{example strip}}

`upper()` and `lower()` change the case, and `replace(old, new)` swaps every `old` piece for `new`.

{{example methods}}

None of these methods changes the string it is called on. Each one gives back a new string. The last line of the example shows that `name` is unchanged. To keep a new string, store it in a name. The second mistake below shows what happens when you forget.

## Searching with in

The word `in` asks whether one string is part of another. The answer is `True` or `False`, so it works as a condition. Upper-case and lower-case letters are different characters, so the match must be exact. `in` also works on a list, where it asks whether an item is in it.

{{example in}}

## Splitting a string into a list

`split` cuts a string at a separator you choose and gives back a list of the pieces. Everything in [Lists](/courses/python/lists) then applies to the result: indexes, `len` and `for` loops.

{{example split}}
