#include <stdio.h>

int square(int n) {
    return n * n;
}

int main(void) {
    int value = square(4);
    printf("%d\n", value + 1);
    return 0;
}
