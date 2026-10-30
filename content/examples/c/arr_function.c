#include <stdio.h>

void double_all(int values[], int length) {
    for (int i = 0; i < length; i++) {
        values[i] *= 2;
    }
}

int main(void) {
    int numbers[3] = {1, 2, 3};
    double_all(numbers, 3);
    for (int i = 0; i < 3; i++) {
        printf("%d\n", numbers[i]);
    }
    return 0;
}
