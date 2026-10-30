#include <stdio.h>

int count_items(int length) {
    return length;
}

int main(void) {
    int numbers[4] = {5, 6, 7, 8};
    int length = sizeof numbers / sizeof numbers[0];
    printf("%d\n", count_items(length));
    return 0;
}
