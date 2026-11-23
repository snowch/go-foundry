package main

import (
	"fmt"
)

func divide(items, size int) (int, int) { return items / size, items % size }

func main() {
	quotient, remainder := divide(8, 3)
	fmt.Println("quotient", quotient, "remainder", remainder)
}
