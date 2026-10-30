#include <stdio.h>

void double_first(int values[]);

int main(void) {
    int numbers[3] = {1, 2, 3};
    double_first(numbers);
    printf("%d\n", numbers[0]);
    return 0;
}

void double_first(int *values) {
    values[0] = values[0] * 2;
}
