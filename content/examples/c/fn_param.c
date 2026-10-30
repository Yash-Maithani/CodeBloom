#include <stdio.h>

void show_square(int number) {
    printf("%d squared is %d\n", number, number * number);
}

int main(void) {
    show_square(3);
    show_square(5);
    return 0;
}
