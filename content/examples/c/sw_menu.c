#include <stdio.h>

int main(void) {
    int choice = 0;
    printf("1 = tea, 2 = coffee, 3 = juice\n");
    printf("Choose: ");
    scanf("%d", &choice);
    switch (choice) {
        case 1:
            printf("You chose tea\n");
            break;
        case 2:
            printf("You chose coffee\n");
            break;
        case 3:
            printf("You chose juice\n");
            break;
        default:
            printf("No such choice\n");
            break;
    }
    return 0;
}
