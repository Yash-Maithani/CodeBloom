#include <stdio.h>

int main(void) {
    int total = 0;
    for (int number = 0; number < 4; number++) {
        total += number;
    }
    printf("%d\n", total);
    return 0;
}
