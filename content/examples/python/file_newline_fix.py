with open("shopping.txt", "w") as file:
    file.write("milk\n")
    file.write("bread\n")

with open("shopping.txt", "r") as file:
    text = file.read()

print(text.strip())
