#include <stdio.h>

void reset(int *number) {
    int zero = 0;
    number = &zero;
    printf("Inside: %d\n", *number);
}

int main(void) {
    int score = 10;
    reset(&score);
    printf("Outside: %d\n", score);
    return 0;
}
