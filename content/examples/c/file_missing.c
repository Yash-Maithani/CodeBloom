#include <stdio.h>

int main(void) {
    FILE *file = fopen("missing.txt", "r");
    if (file == NULL) {
        printf("Could not open missing.txt\n");
    } else {
        printf("Opened missing.txt\n");
        fclose(file);
    }
    return 0;
}
