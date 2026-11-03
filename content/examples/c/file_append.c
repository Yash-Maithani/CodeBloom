#include <stdio.h>

int main(void) {
    FILE *file = fopen("names.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "Ada\n");
    fclose(file);

    file = fopen("names.txt", "a");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "Alan\n");
    fclose(file);

    file = fopen("names.txt", "r");
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
