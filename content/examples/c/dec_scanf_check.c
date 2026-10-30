#include <stdio.h>

int main(void) {
    int number = 0;
    int count = scanf("%d", &number);
    if (count == 1) {
        printf("You typed %d\n", number);
    } else {
        printf("That was not a whole number\n");
    }
    return 0;
}
