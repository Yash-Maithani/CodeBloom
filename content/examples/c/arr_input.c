#include <stdio.h>

int main(void) {
    int numbers[3] = {0};
    printf("Type 3 numbers: ");
    for (int i = 0; i < 3; i++) {
        scanf("%d", &numbers[i]);
    }
    for (int i = 2; i >= 0; i--) {
        printf("%d\n", numbers[i]);
    }
    return 0;
}
