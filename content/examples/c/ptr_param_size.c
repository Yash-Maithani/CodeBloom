#include <stdio.h>

void show_size(int *values) {
    printf("%d\n", sizeof values == sizeof(int *));
}

int main(void) {
    int numbers[4] = {5, 6, 7, 8};
    printf("%d\n", sizeof numbers == 4 * sizeof(int));
    show_size(numbers);
    return 0;
}
