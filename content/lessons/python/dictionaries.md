{{analogy}}

## Making and reading a dictionary

A **dictionary** is written with curly brackets. Each item is a **key**, a colon and a **value**, and items are separated by commas. You read a value by writing its key in square brackets, like an index in a list, but the key takes the place of the position. A dictionary keeps its items in the order they were added.

{{example basics}}

## Adding and changing items

{{example change}}

## Checking for a key

Asking for a key that is not in the dictionary stops the program. The first mistake below shows how. You can check first with `in`, which works on a dictionary as it does on a string and checks the keys, not the values. Or you can use the method `get`, which gives back `None` for a missing key, or a default value that you choose.

{{example check}}

## Going through a dictionary

A `for` loop over a dictionary gives the keys, one at a time, in order. Use each key to look up its value.

{{example loop}}

## Counting with a dictionary

A dictionary is a good way to count things. This program counts how many times each word appears. `split(" ")` from [Strings](/courses/python/strings) turns the sentence into a list of words. The first time a word appears, `get` supplies 0, so its count becomes 1. After that, `get` gives back the stored count and 1 is added.

{{example count}}

{{visual growth}}
