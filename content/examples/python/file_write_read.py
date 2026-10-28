with open("notes.txt", "w") as file:
    file.write("Hello from Python\n")
    file.write("This is line two\n")

with open("notes.txt", "r") as file:
    text = file.read()

print(text.strip())
