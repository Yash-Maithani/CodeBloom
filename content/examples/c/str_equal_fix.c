#include <stdio.h>
#include <string.h>

int main(void) {
    char first[] = "tea";
    char second[] = "tea";
    if (strcmp(first, second) == 0) {
        printf("Same\n");
    } else {
        printf("Different\n");
    }
    return 0;
}
