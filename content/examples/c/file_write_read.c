#include <stdio.h>

int main(void) {
    FILE *file = fopen("notes.txt", "w");
    if (file == NULL) {
        printf("Could not open notes.txt\n");
        return 1;
    }
    fprintf(file, "Hello, file\n");
    fclose(file);

    file = fopen("notes.txt", "r");
    if (file == NULL) {
        printf("Could not open notes.txt\n");
        return 1;
    }
    char line[50];
    if (fgets(line, sizeof line, file) != NULL) {
        printf("%s", line);
    }
    fclose(file);
    return 0;
}
