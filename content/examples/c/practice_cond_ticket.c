#include <stdio.h>

int main(void) {
    int age = 20;
    int member = 0;
    if (age >= 18 && member) {
        printf("Member discount\n");
    } else if (age >= 18 || member) {
        printf("Adult price\n");
    } else {
        printf("Child price\n");
    }
    return 0;
}
