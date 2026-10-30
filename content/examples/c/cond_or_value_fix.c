#include <stdio.h>

int main(void) {
    int day = 3;
    if (day == 6 || day == 7) {
        printf("Weekend\n");
    } else {
        printf("Weekday\n");
    }
    return 0;
}
