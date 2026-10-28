with open("scores.txt", "w") as file:
    file.write("70\n")
    file.write("85\n")
    file.write("90\n")

total = 0
with open("scores.txt", "r") as file:
    for line in file:
        total = total + int(line)
print("Total:", total)
