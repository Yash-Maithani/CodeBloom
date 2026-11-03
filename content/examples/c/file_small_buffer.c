#include <stdio.h>

int main(void) {
    FILE *file = fopen("word.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "abcdefg\n");
    fclose(file);

    file = fopen("word.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char part[5];
    while (fgets(part, sizeof part, file) != NULL) {
        printf("<%s>\n", part);
    }
    fclose(file);
    return 0;
}
