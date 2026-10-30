#include <stdio.h>

void reset(int *number) {
    *number = 0;
    printf("Inside: %d\n", *number);
}

int main(void) {
    int score = 10;
    reset(&score);
    printf("Outside: %d\n", score);
    return 0;
}
