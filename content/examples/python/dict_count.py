words = "the cat and the hat".split(" ")
counts = {}
for word in words:
    counts[word] = counts.get(word, 0) + 1
print(counts)
