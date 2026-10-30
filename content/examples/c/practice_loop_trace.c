#include <stdio.h>

int main(void) {
    int count = 10;
    while (count > 0) {
        count -= 4;
        printf("%d\n", count);
    }
    return 0;
}
