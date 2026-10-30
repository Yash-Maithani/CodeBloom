#include <stdio.h>

struct Point {
    int x;
    int y;
};

int main(void) {
    struct Point a = {1, 2};
    struct Point b = a;
    b.x = 10;
    printf("%d %d\n", a.x, b.x);
    return 0;
}
