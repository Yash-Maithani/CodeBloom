#include <stdio.h>

struct Point {
    int x;
    int y;
};

void move_value(struct Point p) {
    p.x = p.x + 5;
}

void move_pointer(struct Point *p) {
    p->y = p->y + 5;
}

int main(void) {
    struct Point a = {1, 1};
    move_value(a);
    move_pointer(&a);
    printf("%d %d\n", a.x, a.y);
    return 0;
}
