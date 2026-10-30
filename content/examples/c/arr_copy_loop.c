#include <stdio.h>

int main(void) {
    int first[3] = {1, 2, 3};
    int second[3];
    for (int i = 0; i < 3; i++) {
        second[i] = first[i];
    }
    printf("%d\n", second[2]);
    return 0;
}
