#include <stdio.h>

struct Student {
    char name[20];
    int age;
};

int main(void) {
    struct Student students[3] = {{"Ada", 17}, {"Alan", 19}, {"Grace", 18}};
    int total = 0;
    for (int i = 0; i < 3; i++) {
        printf("%s %d\n", students[i].name, students[i].age);
        total += students[i].age;
    }
    printf("Total age: %d\n", total);
    return 0;
}
