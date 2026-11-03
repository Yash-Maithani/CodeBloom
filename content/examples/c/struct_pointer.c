#include <stdio.h>

struct Student {
    char name[20];
    int age;
};

void birthday(struct Student *s) {
    s->age = s->age + 1;
    printf("Inside: %d\n", (*s).age);
}

int main(void) {
    struct Student ada = {"Ada", 17};
    birthday(&ada);
    printf("Outside: %d\n", ada.age);
    return 0;
}
