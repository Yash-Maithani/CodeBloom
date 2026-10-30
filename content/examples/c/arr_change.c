#include <stdio.h>

int main(void) {
    int scores[3] = {1, 2, 3};
    scores[1] = 20;
    for (int i = 0; i < 3; i++) {
        printf("%d\n", scores[i]);
    }
    return 0;
}
