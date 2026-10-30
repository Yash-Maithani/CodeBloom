#include <stdio.h>
#include <string.h>

int main(void) {
    char source[] = "hello";
    char copy[20];
    strcpy(copy, source);
    printf("%s\n", copy);
    source[0] = 'j';
    printf("%s %s\n", source, copy);
    return 0;
}
