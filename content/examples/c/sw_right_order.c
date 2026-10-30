#include <stdio.h>

int main(void) {
    int score = 95;
    if (score >= 90) {
        printf("Distinction\n");
    } else if (score >= 50) {
        printf("Pass\n");
    }
    return 0;
}
