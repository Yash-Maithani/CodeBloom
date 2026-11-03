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
