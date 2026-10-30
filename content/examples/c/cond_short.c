#include <stdio.h>

int main(void) {
    int count = 0;
    int total = 10;
    if (count != 0 && total / count > 2) {
        printf("High average\n");
    } else {
        printf("No average\n");
    }
    return 0;
}
