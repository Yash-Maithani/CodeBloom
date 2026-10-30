#include <stdio.h>

void double_it(int n) {
    n = n * 2;
    printf("%d\n", n);
}

int main(void) {
    int x = 4;
    double_it(x);
    printf("%d\n", x);
    return 0;
}
