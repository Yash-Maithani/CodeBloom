#include <stdio.h>

struct Point {
    int x;
    int y;
};

void show(struct Point *p) {
    printf("%d %d\n", p->x, p->y);
}

int main(void) {
    struct Point a = {3, 4};
    show(&a);
    return 0;
}
