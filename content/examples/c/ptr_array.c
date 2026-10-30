#include <stdio.h>

int main(void) {
    int numbers[3] = {10, 20, 30};
    int *p = numbers;
    printf("%d\n", *p);
    printf("%d\n", *(p + 1));
    printf("%d\n", numbers[1] == *(numbers + 1));
    p++;
    printf("%d\n", *p);
    return 0;
}
