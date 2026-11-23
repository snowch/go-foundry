package main

import (
	"fmt"
)

func search(values []int, target int) (int, int) {
	checks := 0
	for i, v := range values {
		checks++
		if v == target {
			return i, checks
		}
	}
	return -1, checks
}

func main() {
	values := []int{8, 3, 7, 2}
	index, checks := search(values, 7)
	fmt.Println("index", index, "checks", checks)
}
