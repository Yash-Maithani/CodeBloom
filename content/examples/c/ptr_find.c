#include <stdio.h>

int *find(int *values, int length, int target) {
    for (int i = 0; i < length; i++) {
        if (values[i] == target) {
            return &values[i];
        }
    }
    return NULL;
}

int main(void) {
    int numbers[3] = {4, 9, 2};
    int *found = find(numbers, 3, 9);
    int *missing = find(numbers, 3, 7);
    if (found != NULL) {
        printf("Found %d\n", *found);
    }
    if (missing == NULL) {
        printf("Not found\n");
    }
    return 0;
}
