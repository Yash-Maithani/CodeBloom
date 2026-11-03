#include <stdio.h>

int main(void) {
    FILE *file = fopen("log.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "first\n");
    fclose(file);

    file = fopen("log.txt", "a");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "second\n");
    fclose(file);

    file = fopen("log.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char line[50];
    while (fgets(line, sizeof line, file) != NULL) {
        printf("%s", line);
    }
    fclose(file);
    return 0;
}
