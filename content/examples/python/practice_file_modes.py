with open("t.txt", "w") as file:
    file.write("one\n")
    file.write("two\n")

with open("t.txt", "a") as file:
    file.write("three\n")

count = 0
with open("t.txt", "r") as file:
    for line in file:
        count = count + 1
print(count)
