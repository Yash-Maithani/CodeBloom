#include <stdio.h>

int main(void) {
    FILE *file = fopen("scores.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "70\n");
    fprintf(file, "85\n");
    fprintf(file, "90\n");
    fclose(file);

    file = fopen("scores.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char line[50];
    int total = 0;
    while (fgets(line, sizeof line, file) != NULL) {
        int value = 0;
        if (sscanf(line, "%d", &value) == 1) {
            total += value;
        }
    }
    fclose(file);
    printf("Total: %d\n", total);
    return 0;
}
