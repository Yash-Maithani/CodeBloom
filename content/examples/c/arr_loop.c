#include <stdio.h>

int main(void) {
    int scores[4] = {70, 85, 90, 60};
    int length = sizeof scores / sizeof scores[0];
    int total = 0;
    for (int i = 0; i < length; i++) {
        total += scores[i];
    }
    printf("Items: %d\n", length);
    printf("Total: %d\n", total);
    return 0;
}
