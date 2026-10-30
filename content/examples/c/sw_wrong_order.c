#include <stdio.h>

int main(void) {
    int score = 95;
    if (score >= 50) {
        printf("Pass\n");
    } else if (score >= 90) {
        printf("Distinction\n");
    }
    return 0;
}
