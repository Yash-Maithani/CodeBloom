{{analogy}}

## Grouping values with struct

A **structure**, or **struct**, groups values of different types under one name. First define the new type, outside any function, with the keyword `struct`. Each **member** has its own type and name. The definition ends with a semicolon after the closing brace; leaving it out is a compile error. Then declare a variable of that type and give a value for every member, in order. `.` reaches one member. A Python [dictionary](/courses/python/dictionaries) looks things up by a key chosen at run time; a struct's members are fixed when you write the program.

{{example basic}}

Give every member a value. With `-Wextra`, gcc reports a member that is left out (`-Wmissing-field-initializers`): in CodeBloom's test with gcc 13.3, `struct Student s = {"Ada"};` for a struct with three members was an error under the strict flags. The same test found no message at all for `struct Student s = {0};`, with plain gcc, `-Wall`, `-Wall -Wextra` or the strict flags, and every member was set to zero. Other compilers may differ, so giving every member a value is the form that works everywhere. You will often see `typedef struct { ... } Point;`, which lets you write `Point` instead of `struct Point`. This course writes `struct Point`.

## Copying a struct

`=` copies a whole struct, member by member. That includes a `char` array inside it, which `=` cannot copy on its own (see [Arrays](/courses/c/arrays)). The copy is separate from the original.

{{example copy}}

## Arrays of structs

{{example array}}

## Reading into members

A member is a variable like any other. `s.age` is an `int`, so `scanf` needs `&s.age`. (`.` binds tighter than `&`, so this is the address of the member.) `s.name` is an array, so it needs no `&`, as in [Pointers](/courses/c/pointers). The typed lines are in the Typed input panel.

{{example input}}

## Structs and functions

A struct passed to a function is copied, like an `int`. The function changes only its own copy.

{{example byvalue}}

To let the function change the caller's struct, pass its address. With a pointer to a struct, `s->age` means "the `age` member of the struct `s` points to". It is a shorthand for `(*s).age`.

{{example pointer}}

A function can also return a struct. The struct is copied out, so this is safe, unlike returning the address of a local variable.

{{example return}}
