with open("n.txt", "w") as file:
    file.write("4\n")
    file.write("5\n")

total = ""
with open("n.txt", "r") as file:
    for line in file:
        total = total + line.strip()
print(total)
