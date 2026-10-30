#include <stdio.h>

int main(void) {
    char first[10] = "tea";
    char second[10];
    second = first;
    printf("%s\n", second);
    return 0;
}
