#include <stdio.h>

int main(void) {
    int a = 1;
    int b = 1;
    printf("%d\n", !a || b);
    printf("%d\n", !(a || b));
    return 0;
}
