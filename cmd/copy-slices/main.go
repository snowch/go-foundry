package main

import (
	"fmt"
)

func main() {
	original := []int{2, 4, 6}
	copied := make([]int, len(original))
	count := copy(copied, original)
	copied[0] = 9
	fmt.Println("copied count", count)
	fmt.Println("original", original)
	fmt.Println("copy", copied)
}
