#include <stdio.h>

struct Point {
    int x;
    int y;
};

struct Point make_point(int x, int y) {
    struct Point p = {x, y};
    return p;
}

int main(void) {
    struct Point a = make_point(3, 4);
    printf("%d %d\n", a.x, a.y);
    return 0;
}
