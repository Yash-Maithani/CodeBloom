#include <stdio.h>

int double_it(int number) {
    int result = number * 2;
    return result;
}

int main(void) {
    int result = double_it(4);
    printf("%d\n", result);
    return 0;
}
