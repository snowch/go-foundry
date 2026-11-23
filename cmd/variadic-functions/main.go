package main

import (
	"fmt"
)

func sum(values ...int) int {
	total := 0
	for _, value := range values {
		total += value
	}
	return total
}

func main() {
	fmt.Println("literal", sum(1, 2, 3))
	more := []int{4, 5}
	fmt.Println("slice", sum(more...))
}
