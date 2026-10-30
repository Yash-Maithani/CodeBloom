#include <stdio.h>

int main(void) {
    int guess = 0;
    printf("Guess the number: ");
    scanf("%d", &guess);
    while (guess != 7) {
        printf("Try again: ");
        scanf("%d", &guess);
    }
    printf("Correct\n");
    return 0;
}
