#include <stdio.h>

int main(void) {
    int total = 7;
    printf("%.1f\n", total / 2.0);
    printf("%.1f\n", (double)total / 2);
    printf("%.1f\n", (double)(total / 2));
    return 0;
}
