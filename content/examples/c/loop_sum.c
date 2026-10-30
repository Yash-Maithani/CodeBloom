#include <stdio.h>

int main(void) {
    int total = 0;
    for (int number = 1; number <= 4; number++) {
        total += number;
    }
    printf("Total: %d\n", total);
    return 0;
}
