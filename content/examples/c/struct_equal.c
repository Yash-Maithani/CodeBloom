#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main(void) {
    struct Point a = {3, 4};
    struct Point b = {3, 4};
    if (a == b) {
        printf("Same\n");
    }
    return 0;
}
