#include <stdio.h>

int main(void) {
    FILE *out = fopen("memo.txt", "w");
    if (out == NULL) {
        return 1;
    }
    fprintf(out, "Remember the milk\n");

    FILE *in = fopen("memo.txt", "r");
    if (in == NULL) {
        return 1;
    }
    char line[50];
    if (fgets(line, sizeof line, in) == NULL) {
        printf("Nothing was read\n");
    } else {
        printf("%s", line);
    }
    fclose(in);
    fclose(out);
    return 0;
}
