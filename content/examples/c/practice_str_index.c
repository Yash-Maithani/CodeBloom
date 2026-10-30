#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "hello";
    printf("%c %zu %zu\n", word[1], strlen(word), sizeof word);
    return 0;
}
