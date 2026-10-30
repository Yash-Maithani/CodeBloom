#include <stdio.h>

struct Student {
    char name[20];
    int age;
    double score;
};

int main(void) {
    struct Student ada = {"Ada", 17, 91.5};
    printf("%s is %d and scored %.1f\n", ada.name, ada.age, ada.score);
    ada.age = 18;
    printf("%d\n", ada.age);
    return 0;
}
