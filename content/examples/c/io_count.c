#include <stdio.h>

int main(void) {
    int number = 0;
    int count = scanf("%d", &number);
    printf("scanf returned %d\n", count);
    printf("number is %d\n", number);
    return 0;
}
