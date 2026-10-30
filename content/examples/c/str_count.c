#include <stdio.h>

int main(void) {
    char word[] = "cat";
    int length = 0;
    while (word[length] != '\0') {
        length++;
    }
    printf("%d\n", length);
    return 0;
}
