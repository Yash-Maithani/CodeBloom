#include <stdio.h>

int main(void) {
    int level = 2;
    switch (level) {
        case 1:
            printf("Low\n");
            break;
        case 2:
        case 3:
            printf("Medium\n");
            break;
        default:
            printf("High\n");
            break;
    }
    return 0;
}
