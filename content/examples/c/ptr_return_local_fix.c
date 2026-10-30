#include <stdio.h>

int make_number(void) {
    int value = 42;
    return value;
}

int main(void) {
    int number = make_number();
    printf("%d\n", number);
    return 0;
}
