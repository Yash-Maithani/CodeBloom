#include <stdio.h>

void add_one(int number) {
    number = number + 1;
    printf("Inside: %d\n", number);
}

int main(void) {
    int score = 10;
    add_one(score);
    printf("Outside: %d\n", score);
    return 0;
}
