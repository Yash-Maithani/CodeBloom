#include <stdio.h>

int main(void) {
    int age = 0;
    printf("How old are you? ");
    scanf("%d", &age);
    printf("Next year you will be %d.\n", age + 1);
    return 0;
}
