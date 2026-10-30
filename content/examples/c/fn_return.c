#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main(void) {
    int result = add(2, 3);
    printf("%d\n", result);
    printf("%d\n", add(10, 20));
    return 0;
}
