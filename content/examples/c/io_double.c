#include <stdio.h>

int main(void) {
    double price = 0;
    printf("Price: ");
    scanf("%lf", &price);
    printf("Three for %.2f\n", price * 3);
    return 0;
}
