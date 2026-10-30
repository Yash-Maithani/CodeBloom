#include <stdio.h>

int count_items(int values[]) {
    return sizeof values / sizeof values[0];
}

int main(void) {
    int numbers[4] = {5, 6, 7, 8};
    printf("%d\n", count_items(numbers));
    return 0;
}
