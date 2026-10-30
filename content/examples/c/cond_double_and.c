#include <stdio.h>

int main(void) {
    int apples = 2;
    int oranges = 1;
    if (apples && oranges) {
        printf("Both kinds\n");
    } else {
        printf("Missing a kind\n");
    }
    return 0;
}
