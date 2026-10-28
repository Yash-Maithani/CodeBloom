with open("shopping.txt", "w") as file:
    file.write("milk")
    file.write("bread")

with open("shopping.txt", "r") as file:
    print(file.read())
