#include <stdio.h>

int main(void) {
    int total_minutes = 135;
    int hours = total_minutes / 60;
    int minutes = total_minutes % 60;
    printf("%d hours and %d minutes\n", hours, minutes);
    return 0;
}
