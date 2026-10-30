age = 20
member = False
if age >= 18 and member:
    print("Member discount")
elif age >= 18 or member:
    print("Adult price")
else:
    print("Child price")
