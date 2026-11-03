#include <stdio.h>

int main(void) {
    FILE *file = fopen("list.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "a\n");
    fprintf(file, "b\n");
    fclose(file);

    file = fopen("list.txt", "a");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "c\n");
    fclose(file);

    file = fopen("list.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char line[20];
    int count = 0;
    while (fgets(line, sizeof line, file) != NULL) {
        count++;
    }
    fclose(file);
    printf("%d\n", count);
    return 0;
}
