#include <stdio.h>

struct Student {
    char name[20];
    int age;
};

int main(void) {
    struct Student s = {"", 0};
    printf("Name and age: ");
    scanf("%19s", s.name);
    scanf("%d", &s.age);
    printf("%s is %d\n", s.name, s.age);
    return 0;
}
