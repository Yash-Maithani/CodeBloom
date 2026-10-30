#include <stdio.h>

int main(void) {
    int age = 0;
    int *where = &age;
    printf("Age: ");
    scanf("%d", where);
    printf("Next year: %d\n", age + 1);
    return 0;
}
