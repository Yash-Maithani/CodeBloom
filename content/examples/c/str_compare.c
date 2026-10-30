#include <stdio.h>
#include <string.h>

int main(void) {
    char first[] = "tea";
    char second[] = "tea";
    char third[] = "milk";
    printf("%d\n", strcmp(first, second) == 0);
    printf("%d\n", strcmp(first, third) == 0);
    return 0;
}
