with open("log.txt", "w") as file:
    file.write("first\n")

with open("log.txt", "a") as file:
    file.write("second\n")

with open("log.txt", "r") as file:
    text = file.read()

print(text.strip())
