#include <stdio.h>

struct Student {
    char name[20];
    int age;
};

int main(void) {
    struct Student first = {"Ada", 17};
    struct Student second = first;
    second.name[0] = 'E';
    second.age = 18;
    printf("%s %d\n", first.name, first.age);
    printf("%s %d\n", second.name, second.age);
    return 0;
}
