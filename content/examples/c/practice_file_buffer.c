#include <stdio.h>

int main(void) {
    FILE *file = fopen("hello.txt", "w");
    if (file == NULL) {
        return 1;
    }
    fprintf(file, "hello\n");
    fclose(file);

    file = fopen("hello.txt", "r");
    if (file == NULL) {
        return 1;
    }
    char part[4];
    while (fgets(part, sizeof part, file) != NULL) {
        printf("[%s]\n", part);
    }
    fclose(file);
    return 0;
}
