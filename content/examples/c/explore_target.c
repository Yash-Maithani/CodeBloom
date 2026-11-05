#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 20;
    int c = 30;
    int *p = &b;
    printf("Before: a = %d, b = %d, c = %d\n", a, b, c);
    *p = 99;
    printf("After: a = %d, b = %d, c = %d\n", a, b, c);
    return 0;
}
