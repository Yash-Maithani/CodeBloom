#include <stdio.h>

int add(int a, int b) {
    int total = a + b;
    printf("%d + %d is %d\n", a, b, total);
}

int main(void) {
    add(2, 3);
    printf("Done\n");
    return 0;
}
