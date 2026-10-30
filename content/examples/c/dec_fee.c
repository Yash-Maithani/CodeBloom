#include <stdio.h>

int main(void) {
    int total = 80;
    int fee = 0;
    if (total < 50) {
        fee = 5;
    }
    printf("Delivery fee: %d\n", fee);
    return 0;
}
