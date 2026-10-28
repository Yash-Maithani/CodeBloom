with open("shopping.txt", "w") as file:
    file.write("milk\n")
    file.write("bread\n")
    file.write("eggs\n")

with open("shopping.txt", "r") as file:
    for line in file:
        print("Buy:", line.strip())
