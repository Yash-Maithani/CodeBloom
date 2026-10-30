#include <stdio.h>

int main(void) {
    int age = 65;
    if (age < 13) {
        printf("Child ticket\n");
    } else if (age < 65) {
        printf("Standard ticket\n");
    } else {
        printf("Senior ticket\n");
    }
    return 0;
}
