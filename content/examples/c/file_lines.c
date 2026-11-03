#include <stdio.h>

int main(void) {
    FILE *file = fopen("shopping.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "milk\n");
    fprintf(file, "bread\n");
    fprintf(file, "tea\n");
    fclose(file);

    file = fopen("shopping.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char line[50];
    while (fgets(line, sizeof line, file) != NULL) {
        printf("[%s]\n", line);
    }
    fclose(file);
    return 0;
}
