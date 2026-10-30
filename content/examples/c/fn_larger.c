#include <stdio.h>

int larger(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int main(void) {
    int first = 0;
    int second = 0;
    printf("Two numbers: ");
    scanf("%d", &first);
    scanf("%d", &second);
    printf("The larger is %d\n", larger(first, second));
    return 0;
}
