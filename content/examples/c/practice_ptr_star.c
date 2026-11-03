#include <stdio.h>

int main(void) {
    int a = 5;
    int *p = &a;
    *p = *p + 2;
    printf("%d %d\n", a, *p);
    return 0;
}
