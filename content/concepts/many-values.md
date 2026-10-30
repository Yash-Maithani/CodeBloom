A program often handles many related values: the scores of a class, the items in a basket, the days of a week. Giving each value its own variable does not scale, and you cannot repeat an action over variables called score1, score2 and score3. A **collection** keeps many values together under one name, in order.

Each value in a collection is an **item**, and each item has a position called its **index**. In C, C++, Java and Python the first index is 0, not 1, so the last item of a collection of three has index 2. Using an index that does not exist is a mistake. What happens depends on the language: some stop the program with an error, and some do not check at all. Going through the items one by one is a job for a loop.

Python's collection of this kind is called a list. C, C++ and Java have arrays, and C++ also has vectors. They share the ideas above, but they differ from a Python list in important ways, which their own lessons explain.
