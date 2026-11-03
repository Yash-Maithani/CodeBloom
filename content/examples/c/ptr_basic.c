#include <stdio.h>

int main(void) {
    int score = 10;
    int *p = &score;
    printf("%d\n", *p);
    printf("%d\n", p == &score);
    *p = 25;
    printf("%d\n", score);
    return 0;
}
