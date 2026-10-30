#include <stdio.h>

void change(int *a, int b) {
    *a = *a + 1;
    b = b + 1;
}

int main(void) {
    int x = 1;
    int y = 1;
    change(&x, y);
    printf("%d %d\n", x, y);
    return 0;
}
