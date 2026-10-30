#include <stdio.h>

int main(void) {
    int score = 72;
    if (score >= 90) {
        printf("Grade A\n");
    } else if (score >= 70) {
        printf("Grade B\n");
    } else if (score >= 50) {
        printf("Grade C\n");
    } else {
        printf("Grade F\n");
    }
    return 0;
}
