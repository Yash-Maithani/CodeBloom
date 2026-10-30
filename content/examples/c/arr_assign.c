#include <stdio.h>

int main(void) {
    int first[3] = {1, 2, 3};
    int second[3];
    second = first;
    printf("%d\n", second[2]);
    return 0;
}
