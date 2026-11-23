package main

import (
	"fmt"
)

func search(values []int, target int) (int, int) {
	low, high, checks := 0, len(values), 0
	for low < high {
		middle := low + (high-low)/2
		checks++
		if values[middle] == target {
			return middle, checks
		}
		if values[middle] < target {
			low = middle + 1
		} else {
			high = middle
		}
	}
	return -1, checks
}

func main() {
	values := []int{1, 3, 5, 7, 9, 11, 13, 15}
	index, checks := search(values, 11)
	fmt.Println("index", index, "checks", checks)
}
