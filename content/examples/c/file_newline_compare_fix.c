#include <stdio.h>
#include <string.h>

int main(void) {
    FILE *file = fopen("shopping.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "milk\n");
    fprintf(file, "bread\n");
    fclose(file);

    file = fopen("shopping.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char line[50];
    int found = 0;
    while (fgets(line, sizeof line, file) != NULL) {
        size_t length = strlen(line);
        if (length > 0 && line[length - 1] == '\n') {
            line[length - 1] = '\0';
        }
        if (strcmp(line, "bread") == 0) {
            found = 1;
        }
    }
    fclose(file);
    if (found) {
        printf("Found bread\n");
    } else {
        printf("No bread\n");
    }
    return 0;
}
