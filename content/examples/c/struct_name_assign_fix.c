#include <stdio.h>
#include <string.h>

struct Student {
    char name[20];
    int age;
};

int main(void) {
    struct Student s = {"", 0};
    strcpy(s.name, "Ada");
    printf("%s\n", s.name);
    return 0;
}
