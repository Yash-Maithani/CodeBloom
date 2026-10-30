#include <stdio.h>

int *make_number(void) {
    int value = 42;
    return &value;
}

int main(void) {
    int *p = make_number();
    printf("%d\n", *p);
    return 0;
}
