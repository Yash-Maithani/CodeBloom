#include <stdio.h>

int main(void) {
    int count = 5;
    do {
        printf("Count is %d\n", count);
        count++;
    } while (count <= 3);
    return 0;
}
