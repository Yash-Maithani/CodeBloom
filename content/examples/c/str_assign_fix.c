#include <stdio.h>
#include <string.h>

int main(void) {
    char first[10] = "tea";
    char second[10];
    strcpy(second, first);
    printf("%s\n", second);
    return 0;
}
