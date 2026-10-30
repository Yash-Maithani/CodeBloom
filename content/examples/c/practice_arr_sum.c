#include <stdio.h>

int main(void) {
    int numbers[4] = {3, 1, 4, 2};
    int total = 0;
    for (int i = 1; i < 4; i++) {
        total += numbers[i];
    }
    printf("%d\n", total);
    return 0;
}
