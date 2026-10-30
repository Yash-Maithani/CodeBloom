#include <stdio.h>
#include <string.h>

int main(void) {
    char a[] = "tea";
    char b[] = "tea";
    char c[] = "milk";
    printf("%d %d\n", strcmp(a, b) == 0, strcmp(a, c) == 0);
    return 0;
}
