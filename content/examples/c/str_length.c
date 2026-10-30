#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "hello";
    char big[20] = "hello";
    printf("%zu\n", strlen(word));
    printf("%zu\n", sizeof word);
    printf("%zu\n", strlen(big));
    printf("%zu\n", sizeof big);
    return 0;
}
