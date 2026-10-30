#include <stdio.h>

int main(void) {
    int age = 30;
    if (age >= 13 && age < 65) {
        printf("Standard ticket\n");
    } else {
        printf("Other ticket\n");
    }
    return 0;
}
