#include <stdio.h>

void add_one(int *number) {
    *number = *number + 1;
}

int main(void) {
    int score = 10;
    add_one(score);
    printf("%d\n", score);
    return 0;
}
