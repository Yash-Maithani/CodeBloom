#include <stdio.h>

int main(void) {
    int day = 1;
    switch (day) {
        case 1:
            printf("Monday\n");
        case 2:
            printf("Tuesday\n");
            break;
        default:
            printf("Another day\n");
            break;
    }
    return 0;
}
