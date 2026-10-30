#include <stdio.h>

int main(void) {
    char first[] = "tea";
    char second[] = "tea";
    if (first == second) {
        printf("Same\n");
    } else {
        printf("Different\n");
    }
    return 0;
}
