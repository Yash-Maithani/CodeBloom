#include <stdio.h>

void zero_first(int values[]) {
    values[0] = 0;
}

void zero_number(int number) {
    number = 0;
    printf("%d\n", number);
}

int main(void) {
    int items[3] = {5, 6, 7};
    int single = 5;
    zero_first(items);
    zero_number(single);
    printf("%d %d\n", items[0], single);
    return 0;
}
