Sometimes a position is the wrong way to find a value. A phone book lists a number under each name, and a program that stores ages wants to ask for Ada's age, not for the value at position 3. A **key-value collection** stores each **value** under a **key** and finds a value by its key. Each key appears once.

What happens when you ask for a missing key depends on the language and on how you ask: some ways stop with an error, some give back a special "nothing" value, and some quietly add the key. Each language's lesson explains its own rules.

Python's version is called a dictionary. Other languages have something similar, such as a map in Java and C++. The standard library of C has no key-value collection.
