#include <stdio.h>

int main(void) {
    int temperature = 30;
    if (temperature > 10) {
        printf("Mild\n");
    } else if (temperature > 25) {
        printf("Hot\n");
    } else {
        printf("Cold\n");
    }
    return 0;
}
