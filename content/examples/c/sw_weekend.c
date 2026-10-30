#include <stdio.h>

int main(void) {
    int day = 6;
    switch (day) {
        case 6:
        case 7:
            printf("Weekend\n");
            break;
        default:
            printf("Weekday\n");
            break;
    }
    return 0;
}
