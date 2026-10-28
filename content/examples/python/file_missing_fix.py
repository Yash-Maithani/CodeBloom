with open("greeting.txt", "w") as file:
    file.write("Hello again\n")

with open("greeting.txt", "r") as file:
    text = file.read()

print(text.strip())
