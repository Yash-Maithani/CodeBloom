#include <stdio.h>

double average(int a, int b) {
    return (a + b) / 2.0;
}

int main(void) {
    printf("%.2f\n", average(3, 4));
    return 0;
}
