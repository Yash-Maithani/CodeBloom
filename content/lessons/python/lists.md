{{analogy}}

## Making a list

A **list** is written with square brackets, with the items inside separated by commas. Like any value, it can be stored in a variable.

{{example basics}}

Positions start at 0. The last index is one less than the number of items, so a list of three items has indexes 0, 1 and 2. This is the same counting from zero that `range` uses in [Loops: while and for](/courses/python/loops).

## Changing a list

A list can change after it is made. The variable keeps referring to the same list while items are added or replaced.

{{example change}}

## Going through a list

A `for` loop can take a list instead of a `range`. The group runs once per item, and the loop variable is the item itself, so no index is needed. If the list is empty, the group runs zero times.

{{example loop}}

## Names and lists

A variable refers to a list, it does not hold a separate copy. If you give the same list a second name, both names refer to one list. The two mistakes below show how to read an index that is too large, and what a second name means.
