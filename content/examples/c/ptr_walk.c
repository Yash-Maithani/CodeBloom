#include <stdio.h>

int main(void) {
    int numbers[4] = {3, 1, 4, 2};
    int total = 0;
    for (int *p = numbers; p < numbers + 4; p++) {
        total += *p;
    }
    printf("%d\n", total);
    return 0;
}
