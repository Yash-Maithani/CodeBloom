with open("guests.txt", "w") as file:
    file.write("Ada\n")

with open("guests.txt", "a") as file:
    file.write("Grace\n")

with open("guests.txt", "r") as file:
    for line in file:
        print(line.strip())
